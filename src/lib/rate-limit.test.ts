import { beforeEach, describe, expect, it, vi } from 'vitest'

// Sem UPSTASH_*, o módulo cai no backend em memória, que é o que este teste
// exercita. O IP vem do header, mockado abaixo.
vi.mock('@/lib/env.server', () => ({
  serverEnv: {
    NODE_ENV: 'test',
    UPSTASH_REDIS_REST_URL: undefined,
    UPSTASH_REDIS_REST_TOKEN: undefined,
  },
}))

const currentIp = { value: '10.0.0.1' }

vi.mock('next/headers', () => ({
  headers: async () => new Map([['x-forwarded-for', currentIp.value]]),
}))

import { checkRateLimit, RATE_LIMITS, rateLimitMessage } from './rate-limit'

describe('checkRateLimit (backend em memória)', () => {
  beforeEach(() => {
    // Cada teste usa um IP novo: o Map de hits é módulo-global.
    currentIp.value = `10.0.0.${Math.floor(Math.random() * 100_000)}`
  })

  it('libera requisições dentro da cota do bucket', async () => {
    const { tokens } = RATE_LIMITS.login

    for (let i = 0; i < tokens; i++) {
      const result = await checkRateLimit('login', 'user@example.com')
      expect(result.success).toBe(true)
    }
  })

  it('bloqueia ao estourar a cota e informa quando tentar de novo', async () => {
    const { tokens } = RATE_LIMITS.login

    for (let i = 0; i < tokens; i++) {
      await checkRateLimit('login', 'user@example.com')
    }

    const blocked = await checkRateLimit('login', 'user@example.com')
    expect(blocked.success).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it('isola a cota por e-mail: estourar um alvo não trava outro', async () => {
    const { tokens } = RATE_LIMITS.login

    for (let i = 0; i <= tokens; i++) {
      await checkRateLimit('login', 'alvo@example.com')
    }
    expect((await checkRateLimit('login', 'alvo@example.com')).success).toBe(
      false,
    )

    // Mesmo IP, outro e-mail: continua liberado.
    expect((await checkRateLimit('login', 'outro@example.com')).success).toBe(
      true,
    )
  })

  it('isola a cota por bucket: login estourado não bloqueia cadastro', async () => {
    const { tokens } = RATE_LIMITS.login

    for (let i = 0; i <= tokens; i++) {
      await checkRateLimit('login', 'a@example.com')
    }

    expect((await checkRateLimit('register')).success).toBe(true)
  })

  it('usa apenas o primeiro IP da cadeia do x-forwarded-for', async () => {
    const { tokens } = RATE_LIMITS.register
    currentIp.value = '203.0.113.9'

    for (let i = 0; i < tokens; i++) {
      expect((await checkRateLimit('register')).success).toBe(true)
    }

    // Mesmo IP de origem, proxies diferentes na cadeia: ainda é o mesmo cliente.
    currentIp.value = '203.0.113.9, 198.51.100.7'
    expect((await checkRateLimit('register')).success).toBe(false)
  })
})

describe('rateLimitMessage', () => {
  it('mostra minutos em esperas longas', () => {
    expect(rateLimitMessage(600)).toMatch(/10 minutos/)
  })

  it('usa mensagem curta em esperas breves', () => {
    expect(rateLimitMessage(30)).not.toMatch(/minutos/)
  })

  it('nunca revela nada sobre a conta alvo', () => {
    expect(rateLimitMessage(600)).not.toMatch(/@|conta|usuário|existe/i)
  })
})
