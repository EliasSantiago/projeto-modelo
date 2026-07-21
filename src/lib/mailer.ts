import 'server-only'
import { serverEnv } from '@/lib/env.server'

type Mail = { to: string; subject: string; text: string; html?: string }

/** Falha de configuração de e-mail. Nunca deve chegar ao cliente com detalhe. */
export class MailerNotConfiguredError extends Error {
  constructor() {
    super(
      'Envio de e-mail não configurado: defina AUTH_EMAIL_SERVER e AUTH_EMAIL_FROM',
    )
    this.name = 'MailerNotConfiguredError'
  }
}

/** Falha no transporte SMTP (host fora, credencial inválida, recusa). */
export class MailDeliveryError extends Error {
  constructor(cause: unknown) {
    super('Não foi possível entregar o e-mail')
    this.name = 'MailDeliveryError'
    this.cause = cause
  }
}

const isConfigured = () =>
  Boolean(serverEnv.AUTH_EMAIL_SERVER && serverEnv.AUTH_EMAIL_FROM)

/**
 * Garante que dá para enviar e-mail neste ambiente, sem enviar nada.
 *
 * Serve para checar a configuração ANTES de qualquer consulta que dependa da
 * existência de uma conta: se o erro de configuração só aparecesse quando o
 * usuário existe, ele viraria um oráculo de enumeração (SEC).
 */
export function assertMailerConfigured(): void {
  if (!isConfigured() && serverEnv.NODE_ENV === 'production') {
    throw new MailerNotConfiguredError()
  }
}

/**
 * Envio de e-mail via SMTP (nodemailer).
 *
 * Sem SMTP configurado o comportamento depende do ambiente:
 *  - dev/test: registra no console, útil para pegar o link de recuperação
 *    sem depender de um provedor real;
 *  - produção: LANÇA `MailerNotConfiguredError`. Engolir o envio em produção
 *    faria todo reset de senha ser descartado em silêncio, deixando o
 *    usuário travado sem nenhum sinal de erro.
 *
 * Falhas de entrega sempre propagam como `MailDeliveryError`; quem chama
 * decide o que mostrar ao usuário (sem vazar detalhe do transporte, SEC-07).
 */
export async function sendMail(mail: Mail): Promise<void> {
  if (!isConfigured()) {
    if (serverEnv.NODE_ENV === 'production') {
      throw new MailerNotConfiguredError()
    }

    console.info('\n📧 [DEV] E-mail simulado (configure AUTH_EMAIL_SERVER):')
    console.info(`   Para: ${mail.to}`)
    console.info(`   Assunto: ${mail.subject}`)
    console.info(`   ${mail.text}\n`)
    return
  }

  const { default: nodemailer } = await import('nodemailer')
  const transport = nodemailer.createTransport(serverEnv.AUTH_EMAIL_SERVER)

  try {
    await transport.sendMail({
      from: serverEnv.AUTH_EMAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    })
  } catch (error) {
    // Detalhe do SMTP fica no log do servidor, nunca sobe para a UI.
    console.error('[mailer] falha na entrega:', error)
    throw new MailDeliveryError(error)
  }
}
