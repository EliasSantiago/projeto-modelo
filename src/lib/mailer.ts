/**
 * Compatibilidade: o mailer virou `lib/mail/`, com um provedor por arquivo.
 * Este reexport mantém funcionando quem importa de `@/lib/mailer`.
 *
 * Em código novo, importe de `@/lib/mail`.
 */
export {
  assertMailerConfigured,
  isMailerConfigured,
  MailDeliveryError,
  MailerNotConfiguredError,
  sendMail,
  type MailMessage,
  type MailProvider,
} from '@/lib/mail'
