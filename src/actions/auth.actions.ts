'use server'

import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { signIn, signOut } from '@/lib/auth'
import {
  authService,
  EmailInUseError,
  InvalidResetTokenError,
} from '@/services/auth.service'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/schemas/auth.schema'
import { checkRateLimit, rateLimitMessage } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { ROUTES } from '@/constants/routes'

/** Estado padronizado dos formulários de auth (para `useActionState`). */
export type AuthFormState = {
  error?: string
  message?: string
  fieldErrors?: Record<string, string[]>
} | null

const fieldErrorsOf = (error: z.ZodError) =>
  z.flattenError(error).fieldErrors as Record<string, string[]>

/** Login por e-mail/senha (provider Credentials). */
export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

  // Chave por IP + e-mail: um atacante num só IP não trava o login alheio.
  const limit = await checkRateLimit('login', parsed.data.email)
  if (!limit.success) return { error: rateLimitMessage(limit.retryAfter) }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: ROUTES.dashboard,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'E-mail ou senha inválidos' }
    }
    throw error // NEXT_REDIRECT (sucesso), deve propagar.
  }
  return null
}

/** Criação de conta com senha; faz login automático em seguida. */
export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

  // Só por IP: criação de contas em massa vem de um mesmo endereço.
  const limit = await checkRateLimit('register')
  if (!limit.success) return { error: rateLimitMessage(limit.retryAfter) }

  try {
    await authService.register(parsed.data)
  } catch (error) {
    if (error instanceof EmailInUseError) {
      return { fieldErrors: { email: ['E-mail já cadastrado'] } }
    }
    logger.error('Falha ao criar conta', error)
    return { error: 'Não foi possível criar a conta' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: ROUTES.dashboard,
    })
  } catch (error) {
    if (error instanceof AuthError) redirect(ROUTES.login)
    throw error
  }
  return null
}

/** Solicita link de recuperação. Nunca revela se o e-mail existe (SEC). */
export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

  // Só por IP, de propósito: incluir o e-mail na chave deixaria um atacante
  // disparar N mensagens para cada endereço que ele conhecesse.
  const limit = await checkRateLimit('passwordReset')
  if (!limit.success) return { error: rateLimitMessage(limit.retryAfter) }

  try {
    await authService.requestPasswordReset(parsed.data.email)
  } catch (error) {
    // Configuração ausente é falha nossa, não do usuário. A mensagem é a
    // mesma para qualquer e-mail, então não revela quais contas existem.
    logger.error('Falha ao solicitar recuperação de senha', error)
    return {
      error:
        'Serviço de e-mail indisponível no momento. Tente novamente mais tarde.',
    }
  }

  return {
    message:
      'Se houver uma conta com esse e-mail, enviamos um link de recuperação.',
  }
}

/** Redefine a senha a partir de um token válido. */
export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) }

  try {
    await authService.resetPassword(parsed.data.token, parsed.data.password)
  } catch (error) {
    if (error instanceof InvalidResetTokenError) {
      return { error: 'Token inválido ou expirado. Solicite um novo link.' }
    }
    logger.error('Falha ao redefinir senha', error)
    return { error: 'Não foi possível redefinir a senha' }
  }
  redirect(`${ROUTES.login}?reset=success`)
}

/** Inicia o fluxo OAuth de um provedor a partir de um <form>. */
export async function signInWithProvider(provider: string) {
  await signIn(provider, { redirectTo: ROUTES.dashboard })
}

/** Encerra a sessão e volta para a home. */
export async function signOutAction() {
  await signOut({ redirectTo: ROUTES.home })
}
