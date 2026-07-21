import 'server-only'
import { MailDeliveryError, type MailProvider } from '../types'

/**
 * Resend (https://resend.com). API HTTP: não depende de porta SMTP, que
 * costuma estar bloqueada em runtime serverless.
 *
 * O SDK é carregado sob demanda para não entrar no bundle de quem usa outro
 * provedor.
 */
export function createResendProvider(
  apiKey: string,
  from: string,
): MailProvider {
  return {
    name: 'resend',

    async send(message) {
      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)

      // O SDK devolve `{ data, error }` em vez de lançar: um `await` sem
      // checagem daria sucesso silencioso com o e-mail nunca enviado.
      const { error } = await resend.emails.send({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {}),
      })

      if (error) throw new MailDeliveryError('resend', error)
    },
  }
}
