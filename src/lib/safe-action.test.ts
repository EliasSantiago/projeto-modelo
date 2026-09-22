import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

// Mockamos `@/lib/auth` (que puxaria banco e next-auth), não `@/lib/session`:
// assim a hierarquia de papéis exercitada aqui é a de verdade, e não uma
// cópia do comportamento dentro do teste.
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  forbidden: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { SessionUser } from '@/lib/session'
import { adminAction, authAction } from './safe-action'

const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>)

/** Coloca (ou não) um usuário na sessão que `getCurrentUser` vai ler. */
function givenSession(user: SessionUser | null) {
  mockAuth.mockResolvedValue(user ? { user } : null)
}

const asUser = (role: SessionUser['role'] = 'user'): SessionUser => ({
  id: 'user-1',
  role,
  emailVerified: new Date(),
  email: 'x@example.com',
})

const schema = z.object({ title: z.string().min(3) })

beforeEach(() => vi.clearAllMocks())

describe('authAction, ordem das checagens', () => {
  it('barra sem sessão ANTES de validar a entrada', async () => {
    givenSession(null)
    const handler = vi.fn()

    // Entrada inválida de propósito: se a resposta trouxesse `fieldErrors`,
    // um anônimo estaria descobrindo o formato esperado pela action.
    const result = await authAction(schema, handler)({ title: 'x' })

    expect(result).toEqual({ ok: false, error: 'Não autorizado' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('barra papel insuficiente com a MESMA mensagem de "não autorizado"', async () => {
    givenSession(asUser('user'))
    const handler = vi.fn()

    const result = await adminAction(schema, handler)({ title: 'válido' })

    // Distinguir "não logado" de "logado sem permissão" confirmaria a um
    // usuário comum que a action existe e o que ela exige.
    expect(result).toEqual({ ok: false, error: 'Não autorizado' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('rejeita entrada inválida sem chamar o handler', async () => {
    givenSession(asUser())
    const handler = vi.fn()

    const result = await authAction(schema, handler)({ title: 'ab' })

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('esperava falha de validação')
    expect(result.error).toBe('Dados inválidos')
    expect(result.fieldErrors?.title).toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('authAction, execução', () => {
  it('entrega ao handler o dado JÁ PARSEADO e o usuário da sessão', async () => {
    const user = asUser()
    givenSession(user)
    const handler = vi.fn().mockResolvedValue({ id: 'task-1' })

    const result = await authAction(
      schema,
      handler,
    )({
      title: 'comprar pão',
      // Campo a mais: o handler deve receber a saída do Zod, não o cru.
      role: 'admin',
    } as never)

    expect(result).toEqual({ ok: true, data: { id: 'task-1' } })
    expect(handler).toHaveBeenCalledWith({ title: 'comprar pão' }, { user })
  })

  it('admin satisfaz uma action que exige apenas `user` (hierarquia)', async () => {
    givenSession(asUser('admin'))
    const handler = vi.fn().mockResolvedValue('ok')

    const result = await authAction(schema, handler, { role: 'user' })({
      title: 'válido',
    })

    expect(result).toEqual({ ok: true, data: 'ok' })
  })
})

describe('authAction, tratamento de erro', () => {
  it('não vaza a mensagem interna de uma exceção qualquer', async () => {
    givenSession(asUser())
    const boom = new Error('connect ECONNREFUSED 10.0.0.5:5432')
    const handler = vi.fn().mockRejectedValue(boom)

    const result = await authAction(schema, handler)({ title: 'válido' })

    expect(result).toEqual({
      ok: false,
      error: 'Não foi possível concluir a operação',
    })
    // O detalhe existe, só não sai do servidor (SEC-07).
    expect(logger.error).toHaveBeenCalledWith('Server Action falhou', boom, {
      userId: 'user-1',
    })
  })

  it('deixa passar a mensagem de erro de domínio esperado', async () => {
    givenSession(asUser())
    const notFound = new Error('Tarefa não encontrada')
    notFound.name = 'TaskNotFoundError'
    const handler = vi.fn().mockRejectedValue(notFound)

    const result = await authAction(schema, handler)({ title: 'válido' })

    expect(result).toEqual({ ok: false, error: 'Tarefa não encontrada' })
  })
})
