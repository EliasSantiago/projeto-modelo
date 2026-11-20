import { beforeEach, describe, expect, it, vi } from 'vitest'

// Backend de rate limit em memória (sem UPSTASH_*), IP vindo do header.
vi.mock('@/lib/env.server', () => ({
  serverEnv: {
    NODE_ENV: 'test',
    UPSTASH_REDIS_REST_URL: undefined,
    UPSTASH_REDIS_REST_TOKEN: undefined,
  },
}))

const currentIp = { value: '10.0.0.1' }
vi.mock('next/headers', () => ({
  headers: async () => new Map([['x-real-ip', currentIp.value]]),
}))

// next-auth não carrega fora do runtime do Next; só a classe base importa aqui.
vi.mock('next-auth', () => ({
  CredentialsSignin: class CredentialsSignin extends Error {
    code = 'credentials'
  },
}))

const verifyCredentials = vi.fn()
vi.mock('@/services/auth.service', () => ({
  authService: {
    verifyCredentials: (...args: unknown[]) => verifyCredentials(...args),
  },
}))

import {
  authorizeCredentials,
  LoginRateLimitedError,
  oauthProvesEmail,
} from './auth-credentials'
import { RATE_LIMITS } from './rate-limit'

const dummyUser = { id: 'u1', email: 'vitima@example.com', role: 'user' }

describe('authorizeCredentials', () => {
  beforeEach(() => {
    // IP novo por teste: o contador em memória é global ao módulo.
    currentIp.value = `10.1.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
    verifyCredentials.mockReset()
    verifyCredentials.mockResolvedValue(dummyUser)
  })

  it('recusa entrada inválida sem gastar cota nem rodar bcrypt', async () => {
    expect(await authorizeCredentials({ email: 'x', password: '' })).toBeNull()
    expect(verifyCredentials).not.toHaveBeenCalled()
  })

  it('verifica a senha enquanto houver cota', async () => {
    const user = await authorizeCredentials({
      email: ' Vitima@Example.com ',
      password: 'senha-errada',
    })
    expect(user).toEqual(dummyUser)
    expect(verifyCredentials).toHaveBeenCalledWith(
      'vitima@example.com',
      'senha-errada',
    )
  })

  // Regressão: o limite valia só na Server Action, e o callback do Auth.js
  // (POST /api/auth/callback/credentials) chama `authorize` direto.
  it('bloqueia a força bruta no próprio authorize, sem passar pela action', async () => {
    const { tokens } = RATE_LIMITS.login
    const attempt = () =>
      authorizeCredentials({ email: 'vitima@example.com', password: 'chute' })

    for (let i = 0; i < tokens; i++) await attempt()
    expect(verifyCredentials).toHaveBeenCalledTimes(tokens)

    const blocked = await attempt().catch((error: unknown) => error)
    expect(blocked).toBeInstanceOf(LoginRateLimitedError)
    expect((blocked as LoginRateLimitedError).code).toBe('rate_limited')
    expect((blocked as LoginRateLimitedError).retryAfter).toBeGreaterThan(0)
    // A tentativa bloqueada não chega ao bcrypt.
    expect(verifyCredentials).toHaveBeenCalledTimes(tokens)
  })

  it('a cota é por IP + e-mail: outro e-mail no mesmo IP segue liberado', async () => {
    const { tokens } = RATE_LIMITS.login
    for (let i = 0; i <= tokens; i++) {
      await authorizeCredentials({
        email: 'alvo@example.com',
        password: 'chute',
      }).catch(() => undefined)
    }
    await expect(
      authorizeCredentials({ email: 'outra@example.com', password: 'x' }),
    ).resolves.toEqual(dummyUser)
  })
})

describe('oauthProvesEmail', () => {
  it('aceita quando o provedor devolveu o mesmo e-mail da conta', () => {
    expect(oauthProvesEmail('pessoa@example.com', 'pessoa@example.com')).toBe(
      true,
    )
  })

  it('ignora caixa e espaços', () => {
    expect(oauthProvesEmail('Pessoa@Example.com', ' pessoa@example.COM ')).toBe(
      true,
    )
  })

  // Regressão: logado com e-mail alheio, vincular um GitHub de outro
  // endereço marcava a conta como verificada.
  it('recusa quando o e-mail do perfil é outro', () => {
    expect(
      oauthProvesEmail('chefe@empresa-alheia.com', 'atacante@github.example'),
    ).toBe(false)
  })

  it('recusa quando falta e-mail de um dos lados', () => {
    expect(oauthProvesEmail('pessoa@example.com', undefined)).toBe(false)
    expect(oauthProvesEmail(null, 'pessoa@example.com')).toBe(false)
    expect(oauthProvesEmail('', '')).toBe(false)
  })
})
