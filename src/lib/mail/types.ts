import 'server-only'

/** Mensagem a enviar. `html` é opcional: todo e-mail precisa de versão texto. */
export type MailMessage = {
  to: string
  subject: string
  text: string
  html?: string
}

/**
 * Contrato de um provedor de e-mail.
 *
 * Acrescentar Postmark, SES ou outro é criar um arquivo em `providers/` que
 * satisfaça esta interface e registrá-lo em `index.ts`. Nenhum service
 * precisa saber qual provedor está ativo.
 */
export type MailProvider = {
  /** Nome curto, usado em log e na variável `MAIL_PROVIDER`. */
  readonly name: string
  /**
   * Envia a mensagem. Deve LANÇAR em falha de entrega — provedores que
   * devolvem erro em objeto (Resend) precisam converter.
   */
  send(message: MailMessage): Promise<void>
}

/** Falha de entrega, qualquer que seja o provedor. */
export class MailDeliveryError extends Error {
  constructor(
    public readonly provider: string,
    cause: unknown,
  ) {
    super('Não foi possível entregar o e-mail')
    this.name = 'MailDeliveryError'
    this.cause = cause
  }
}

/** Nenhum provedor utilizável neste ambiente. */
export class MailerNotConfiguredError extends Error {
  constructor() {
    super(
      'Envio de e-mail não configurado: defina RESEND_API_KEY (ou AUTH_EMAIL_SERVER) e MAIL_FROM',
    )
    this.name = 'MailerNotConfiguredError'
  }
}
