import 'server-only'
import { serverEnv } from '@/lib/env.server'

type Mail = { to: string; subject: string; text: string; html?: string }

/**
 * Envio de e-mail. Em produção usa SMTP (nodemailer) se configurado; em
 * desenvolvimento (ou sem SMTP) apenas registra no console — útil para pegar
 * o link de recuperação sem depender de um provedor real.
 */
export async function sendMail(mail: Mail): Promise<void> {
  if (serverEnv.AUTH_EMAIL_SERVER && serverEnv.AUTH_EMAIL_FROM) {
    const { default: nodemailer } = await import('nodemailer')
    const transport = nodemailer.createTransport(serverEnv.AUTH_EMAIL_SERVER)
    await transport.sendMail({
      from: serverEnv.AUTH_EMAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    })
    return
  }

  console.info('\n📧 [DEV] E-mail simulado (configure AUTH_EMAIL_SERVER):')
  console.info(`   Para: ${mail.to}`)
  console.info(`   Assunto: ${mail.subject}`)
  console.info(`   ${mail.text}\n`)
}
