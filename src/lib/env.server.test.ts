import { describe, expect, it } from 'vitest'
import { AUTH_SECRET_PLACEHOLDER, serverEnvSchema } from './env.server'

const base = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
}

const parse = (NODE_ENV: string, AUTH_SECRET: string) =>
  serverEnvSchema.safeParse({ ...base, NODE_ENV, AUTH_SECRET })

describe('serverEnvSchema, AUTH_SECRET (SEC-33)', () => {
  it('recusa em produção o segredo de exemplo do .env.example', () => {
    expect(parse('production', AUTH_SECRET_PLACEHOLDER).success).toBe(false)
  })

  it('recusa em produção segredo curto', () => {
    expect(parse('production', 'a'.repeat(31)).success).toBe(false)
  })

  it('aceita em produção segredo forte', () => {
    expect(parse('production', 'a'.repeat(32)).success).toBe(true)
  })

  it('aceita o exemplo fora de produção, para o primeiro boot não travar', () => {
    expect(parse('development', AUTH_SECRET_PLACEHOLDER).success).toBe(true)
  })

  it('aponta o problema no campo AUTH_SECRET', () => {
    const result = parse('production', AUTH_SECRET_PLACEHOLDER)
    expect(result.error?.issues[0]?.path).toEqual(['AUTH_SECRET'])
  })
})
