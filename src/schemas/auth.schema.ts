import { z } from 'zod'

/** Schemas Zod das telas de autenticação (fonte da verdade, cliente e servidor). */

const email = z.string().trim().toLowerCase().email('E-mail inválido')

/**
 * O bcrypt só lê os primeiros 72 BYTES da senha e ignora o resto em silêncio.
 * Limitar por caracteres não basta: em UTF-8, acento ocupa 2 bytes e emoji 4,
 * então 40 caracteres acentuados já passam do limite e duas senhas que só
 * diferem no final viram o mesmo hash. `TextEncoder` existe no browser e no
 * Node, o que mantém este schema reutilizável nos dois lados.
 */
export const BCRYPT_MAX_BYTES = 72
const utf8Length = (value: string) => new TextEncoder().encode(value).length

const password = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .refine((value) => utf8Length(value) <= BCRYPT_MAX_BYTES, {
    message: 'Senha longa demais (acentos e emoji contam como mais de um)',
  })

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe seu nome').max(120),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha'),
})

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token ausente'),
})

export const resendVerificationSchema = z.object({ email })

/** Provedores sociais que a UI sabe oferecer (ver `enabledProviders`). */
export const oauthProviderSchema = z.enum(['google', 'github'])

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type OAuthProvider = z.infer<typeof oauthProviderSchema>
