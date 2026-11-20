import { beforeEach, describe, expect, it, vi } from 'vitest'

// Classes de erro do next-auth: a base real não carrega fora do Next.
vi.mock('next-auth', () => {
  class AuthError extends Error {}
  class CredentialsSignin extends AuthError {
    code = 'credentials'
  }
  return { AuthError, CredentialsSignin }
})

const signIn = vi.fn()
vi.mock('@/lib/auth', () => ({
  signIn: (...args: unknown[]) => signIn(...args),
  signOut: vi.fn(),
  enabledProviders: { google: false, github: false },
}))

// O limite agora roda no `authorize`; a action não deve consultá-lo de novo.
const checkRateLimit = vi.fn()
vi.mock('@/lib/rate-limit', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/rate-limit')>()),
  checkRateLimit: (...args: unknown[]) => checkRateLimit(...args),
}))

vi.mock('@/services/auth.service', () => ({ authService: {} }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))
vi.mock('@/lib/env.server', () => ({ serverEnv: { NODE_ENV: 'test' } }))

import { CredentialsSignin } from 'next-auth'
import { LoginRateLimitedError } from '@/lib/auth-credentials'
import { loginAction } from './auth.actions'

function form(email: string, password: string) {
  const fd = new FormData()
  fd.set('email', email)
  fd.set('password', password)
  return fd
}

describe('loginAction', () => {
  beforeEach(() => {
    signIn.mockReset()
    checkRateLimit.mockReset()
  })

  it('mostra a mensagem de espera quando o authorize recusa pelo limite', async () => {
    signIn.mockRejectedValue(new LoginRateLimitedError(300))

    const result = await loginAction(null, form('a@example.com', 'senha'))

    expect(result).toEqual({
      error: 'Muitas tentativas. Tente novamente em 5 minutos.',
    })
  })

  it('mantém a mensagem neutra para credencial inválida', async () => {
    signIn.mockRejectedValue(new CredentialsSignin())

    const result = await loginAction(null, form('a@example.com', 'errada'))

    expect(result).toEqual({ error: 'E-mail ou senha inválidos' })
  })

  it('não consulta o limite fora do authorize (evita contar em dobro)', async () => {
    signIn.mockRejectedValue(new CredentialsSignin())

    await loginAction(null, form('a@example.com', 'errada'))

    expect(checkRateLimit).not.toHaveBeenCalled()
    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'a@example.com',
      password: 'errada',
      redirectTo: '/dashboard',
    })
  })

  it('deixa o redirect de sucesso propagar', async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT',
    })
    signIn.mockRejectedValue(redirect)

    await expect(
      loginAction(null, form('a@example.com', 'certa')),
    ).rejects.toBe(redirect)
  })
})
