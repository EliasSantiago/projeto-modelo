import { beforeEach, describe, expect, it, vi } from 'vitest'

const send = vi.fn()

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

import { createResendProvider } from './resend'

const provider = createResendProvider('re_test', 'Projeto <no-reply@x.com>')
const message = { to: 'quem@example.com', subject: 'Oi', text: 'corpo' }

describe('provedor Resend', () => {
  beforeEach(() => vi.clearAllMocks())

  it('converte erro em objeto para exceção', async () => {
    // O SDK NÃO lança: devolve `{ data, error }`. Sem esta conversão, um
    // `await` sem checagem daria sucesso com o e-mail nunca enviado.
    send.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', message: 'domínio não verificado' },
    })

    await expect(provider.send(message)).rejects.toMatchObject({
      name: 'MailDeliveryError',
      provider: 'resend',
    })
  })

  it('resolve quando o envio dá certo', async () => {
    send.mockResolvedValue({ data: { id: 'msg_1' }, error: null })
    await expect(provider.send(message)).resolves.toBeUndefined()
  })

  it('envia o destinatário como lista, formato esperado pela API', async () => {
    send.mockResolvedValue({ data: { id: 'msg_1' }, error: null })
    await provider.send(message)

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Projeto <no-reply@x.com>',
        to: ['quem@example.com'],
      }),
    )
  })

  it('omite html quando a mensagem é só texto', async () => {
    send.mockResolvedValue({ data: { id: 'msg_1' }, error: null })
    await provider.send(message)

    expect(send.mock.calls[0]![0]).not.toHaveProperty('html')
  })
})
