import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/env.server', () => ({
  serverEnv: { NODE_ENV: 'test' },
}))

import { logger, setErrorReporter } from './logger'

/** Captura o payload logado, já serializado pelo logger. */
function captureError() {
  return vi.spyOn(console, 'error').mockImplementation(() => {})
}

describe('logger, redação de dados sensíveis', () => {
  let spy: ReturnType<typeof captureError>

  beforeEach(() => {
    spy = captureError()
  })
  afterEach(() => spy.mockRestore())

  it('mascara campos sensíveis no contexto', () => {
    logger.error('teste', undefined, {
      email: 'quem@example.com',
      password: 'senha-secreta',
      token: 'abc123',
    })

    const logged = JSON.stringify(spy.mock.calls[0])
    expect(logged).not.toContain('senha-secreta')
    expect(logged).not.toContain('abc123')
    // O que não é sensível continua visível, senão o log perde a serventia.
    expect(logged).toContain('quem@example.com')
  })

  it('mascara em qualquer profundidade, não só no primeiro nível', () => {
    logger.error('teste', undefined, {
      user: { profile: { passwordHash: 'hash-secreto' } },
    })

    expect(JSON.stringify(spy.mock.calls[0])).not.toContain('hash-secreto')
  })

  it('mascara dentro de arrays', () => {
    logger.error('teste', undefined, {
      contas: [{ secret: 'valor-secreto' }],
    })

    expect(JSON.stringify(spy.mock.calls[0])).not.toContain('valor-secreto')
  })

  it('não entra em laço infinito com referência circular', () => {
    const circular: Record<string, unknown> = { nome: 'x' }
    circular.self = circular

    expect(() => logger.error('teste', undefined, circular)).not.toThrow()
  })
})

describe('logger.error, serialização e reporter', () => {
  let spy: ReturnType<typeof captureError>

  beforeEach(() => {
    spy = captureError()
  })
  afterEach(() => {
    spy.mockRestore()
    setErrorReporter(() => {})
  })

  it('preserva nome e mensagem do erro', () => {
    logger.error('falhou', new TypeError('valor inválido'))

    const logged = JSON.stringify(spy.mock.calls[0])
    expect(logged).toContain('TypeError')
    expect(logged).toContain('valor inválido')
  })

  it('preserva a cadeia de causa', () => {
    const raiz = new Error('conexão recusada')
    logger.error('falhou', new Error('envio falhou', { cause: raiz }))

    expect(JSON.stringify(spy.mock.calls[0])).toContain('conexão recusada')
  })

  it('encaminha o erro ao reporter registrado', () => {
    const reporter = vi.fn()
    setErrorReporter(reporter)

    const erro = new Error('explodiu')
    logger.error('falhou', erro, { userId: 'u1' })

    expect(reporter).toHaveBeenCalledWith(erro, { userId: 'u1' })
  })

  it('falha do reporter não derruba quem chamou o logger', () => {
    setErrorReporter(() => {
      throw new Error('Sentry fora do ar')
    })

    expect(() => logger.error('falhou', new Error('x'))).not.toThrow()
  })

  it('não chama o reporter quando não há erro', () => {
    const reporter = vi.fn()
    setErrorReporter(reporter)

    logger.error('só uma mensagem')

    expect(reporter).not.toHaveBeenCalled()
  })
})
