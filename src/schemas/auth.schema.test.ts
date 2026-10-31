import { describe, expect, it } from 'vitest'
import bcrypt from 'bcryptjs'
import {
  BCRYPT_MAX_BYTES,
  loginSchema,
  oauthProviderSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema'

const register = (password: string) =>
  registerSchema.safeParse({
    name: 'Fulano',
    email: 'fulano@example.com',
    password,
    confirmPassword: password,
  })

describe('registerSchema', () => {
  it('normaliza o e-mail (trim + minúsculas)', () => {
    const result = registerSchema.safeParse({
      name: 'Fulano',
      email: '  Fulano@Example.COM ',
      password: 'senha-forte-1',
      confirmPassword: 'senha-forte-1',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('fulano@example.com')
  })

  it('rejeita confirmação diferente da senha', () => {
    const result = registerSchema.safeParse({
      name: 'Fulano',
      email: 'fulano@example.com',
      password: 'senha-forte-1',
      confirmPassword: 'senha-forte-2',
    })
    expect(result.success).toBe(false)
  })

  it('aceita senha ASCII no limite de 72 bytes', () => {
    expect(register('a'.repeat(BCRYPT_MAX_BYTES)).success).toBe(true)
  })

  it('mede o limite em bytes, não em caracteres', () => {
    // 40 caracteres, 80 bytes: passaria num `max(72)` por caractere.
    const accented = 'ç'.repeat(40)
    expect(accented.length).toBeLessThan(BCRYPT_MAX_BYTES)
    expect(register(accented).success).toBe(false)
  })

  it('protege contra a colisão que o truncamento do bcrypt causaria', () => {
    // Prova do risco que a regra evita: além de 72 bytes o bcrypt ignora o
    // final, e duas senhas diferentes passam a valer o mesmo hash.
    const prefix = 'ç'.repeat(36) // 72 bytes
    const hash = bcrypt.hashSync(`${prefix}senhaA`, 4)
    expect(bcrypt.compareSync(`${prefix}senhaB`, hash)).toBe(true)

    expect(register(`${prefix}senhaA`).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('aplica o mesmo limite de bytes da criação de conta', () => {
    const password = '🔒'.repeat(19) // 76 bytes
    const result = resetPasswordSchema.safeParse({
      token: 't',
      password,
      confirmPassword: password,
    })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('exige senha preenchida', () => {
    expect(
      loginSchema.safeParse({ email: 'a@example.com', password: '' }).success,
    ).toBe(false)
  })
})

describe('oauthProviderSchema', () => {
  it('aceita apenas provedores conhecidos', () => {
    expect(oauthProviderSchema.safeParse('google').success).toBe(true)
    expect(oauthProviderSchema.safeParse('github').success).toBe(true)
    expect(oauthProviderSchema.safeParse('credentials').success).toBe(false)
    expect(oauthProviderSchema.safeParse({ id: 'google' }).success).toBe(false)
  })
})
