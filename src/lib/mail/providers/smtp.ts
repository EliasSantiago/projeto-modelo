import 'server-only'
import { MailDeliveryError, type MailProvider } from '../types'

/**
 * SMTP via nodemailer. Serve qualquer provedor com credencial SMTP, útil para
 * quem já tem um relay próprio ou não quer depender de API de terceiro.
 *
 * Em serverless, prefira um provedor HTTP (Resend): a porta SMTP de saída é
 * frequentemente bloqueada e a conexão custa caro por invocação.
 */
export function createSmtpProvider(
  connectionUrl: string,
  from: string,
): MailProvider {
  return {
    name: 'smtp',

    async send(message) {
      const { default: nodemailer } = await import('nodemailer')
      const transport = nodemailer.createTransport(connectionUrl)

      try {
        await transport.sendMail({
          from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
        })
      } catch (error) {
        throw new MailDeliveryError('smtp', error)
      }
    },
  }
}
