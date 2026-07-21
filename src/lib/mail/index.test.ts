import { beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, unknown> = {}

vi.mock('@/lib/env.server', () => ({
  get serverEnv() {
    return env
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

/** Recarrega o módulo: o provedor é memoizado na primeira chamada. */
async function loadMail() {
  vi.resetModules()
  return import('./index')
}

function setEnv(next: Record<string, unknown>) {
  for (const key of Object.keys(env)) delete env[key]
  Object.assign(env, { NODE_ENV: 'production' }, next)
}

describe('seleção de provedor', () => {
  beforeEach(() => setEnv({}))

  it('usa Resend quando há chave e remetente', async () => {
    setEnv({ RESEND_API_KEY: 're_123', MAIL_FROM: 'a@b.com' })
    const { isMailerConfigured } = await loadMail()
    expect(isMailerConfigured()).toBe(true)
  })

  it('prefere Resend a SMTP quando ambos estão configurados', async () => {
    setEnv({
      RESEND_API_KEY: 're_123',
      AUTH_EMAIL_SERVER: 'smtp://u:p@h:587',
      MAIL_FROM: 'a@b.com',
    })
    const { sendMail } = await loadMail()

    // Sem rede: o provedor Resend falha ao chamar a API, mas a mensagem de
    // erro identifica qual provedor foi escolhido.
    await expect(
      sendMail({ to: 'x@y.com', subject: 's', text: 't' }),
    ).rejects.toMatchObject({ provider: 'resend' })
  })

  it('cai para SMTP quando só ele está configurado', async () => {
    setEnv({
      AUTH_EMAIL_SERVER: 'smtp://u:p@127.0.0.1:1',
      MAIL_FROM: 'a@b.com',
    })
    const { sendMail } = await loadMail()

    await expect(
      sendMail({ to: 'x@y.com', subject: 's', text: 't' }),
    ).rejects.toMatchObject({ provider: 'smtp' })
  })

  it('aceita AUTH_EMAIL_FROM como nome legado de MAIL_FROM', async () => {
    setEnv({ RESEND_API_KEY: 're_123', AUTH_EMAIL_FROM: 'a@b.com' })
    const { isMailerConfigured } = await loadMail()
    expect(isMailerConfigured()).toBe(true)
  })

  it('MAIL_PROVIDER explícito não cai em fallback silencioso', async () => {
    // Pediu Resend sem chave: deve falhar, não usar o SMTP que está ali.
    setEnv({
      MAIL_PROVIDER: 'resend',
      AUTH_EMAIL_SERVER: 'smtp://u:p@h:587',
      MAIL_FROM: 'a@b.com',
    })
    const { isMailerConfigured, sendMail } = await loadMail()

    expect(isMailerConfigured()).toBe(false)
    await expect(
      sendMail({ to: 'x@y.com', subject: 's', text: 't' }),
    ).rejects.toThrow(/não configurado/i)
  })
})

describe('proteção contra e-mail engolido', () => {
  it('em produção sem provedor, lança em vez de descartar', async () => {
    setEnv({})
    const { sendMail, isMailerConfigured } = await loadMail()

    expect(isMailerConfigured()).toBe(false)
    await expect(
      sendMail({ to: 'x@y.com', subject: 's', text: 't' }),
    ).rejects.toThrow(/não configurado/i)
  })

  it('em dev sem provedor, imprime no console e não lança', async () => {
    setEnv({ NODE_ENV: 'development' })
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const { sendMail } = await loadMail()

    await expect(
      sendMail({ to: 'x@y.com', subject: 'assunto', text: 'corpo' }),
    ).resolves.toBeUndefined()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('assertMailerConfigured não atrapalha fora de produção', async () => {
    setEnv({ NODE_ENV: 'development' })
    const { assertMailerConfigured } = await loadMail()
    expect(() => assertMailerConfigured()).not.toThrow()
  })

  it('assertMailerConfigured barra produção sem provedor real', async () => {
    setEnv({})
    const { assertMailerConfigured } = await loadMail()
    expect(() => assertMailerConfigured()).toThrow(/não configurado/i)
  })

  it('console explícito continua sendo recusado em produção', async () => {
    setEnv({ MAIL_PROVIDER: 'console' })
    const { sendMail } = await loadMail()
    await expect(
      sendMail({ to: 'x@y.com', subject: 's', text: 't' }),
    ).rejects.toThrow(/não configurado/i)
  })
})
