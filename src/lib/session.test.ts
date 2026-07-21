import { beforeEach, describe, expect, it, vi } from 'vitest'

// `@/lib/auth` puxa o cliente do banco e o env do servidor; aqui só
// interessa a lógica de autorização.
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
  forbidden: vi.fn(() => {
    throw new Error('NEXT_FORBIDDEN')
  }),
}))

import { auth } from '@/lib/auth'
import { forbidden, redirect } from 'next/navigation'
import { hasRole, requireRole, requireUser, type SessionUser } from './session'

const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>)

const asUser = (role: SessionUser['role']): SessionUser => ({
  id: 'user-1',
  role,
  email: 'x@example.com',
})

describe('hasRole', () => {
  it('aceita o papel exato', () => {
    expect(hasRole(asUser('user'), 'user')).toBe(true)
    expect(hasRole(asUser('admin'), 'admin')).toBe(true)
  })

  it('admin satisfaz exigência de user (hierarquia, não igualdade)', () => {
    expect(hasRole(asUser('admin'), 'user')).toBe(true)
  })

  it('user não satisfaz exigência de admin', () => {
    expect(hasRole(asUser('user'), 'admin')).toBe(false)
  })
})

describe('requireUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('manda para o login quando não há sessão', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(requireUser()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalled()
  })

  it('devolve o usuário quando há sessão', async () => {
    mockAuth.mockResolvedValue({ user: asUser('user') })
    await expect(requireUser()).resolves.toMatchObject({ id: 'user-1' })
  })
})

describe('requireRole', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sem sessão vai para o login, não para o 403', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(requireRole('admin')).rejects.toThrow('NEXT_REDIRECT')
    expect(forbidden).not.toHaveBeenCalled()
  })

  it('com sessão e papel insuficiente responde 403, não redireciona', async () => {
    mockAuth.mockResolvedValue({ user: asUser('user') })
    await expect(requireRole('admin')).rejects.toThrow('NEXT_FORBIDDEN')
    expect(forbidden).toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('deixa passar quem tem o papel', async () => {
    mockAuth.mockResolvedValue({ user: asUser('admin') })
    await expect(requireRole('admin')).resolves.toMatchObject({
      role: 'admin',
    })
  })
})
