import 'server-only'
import { serverEnv } from '@/lib/env.server'
import { logger } from '@/lib/logger'
import { createConsoleProvider } from './providers/console'
import { createResendProvider } from './providers/resend'
import { createSmtpProvider } from './providers/smtp'
import {
  MailerNotConfiguredError,
  type MailMessage,
  type MailProvider,
} from './types'

export {
  MailDeliveryError,
  MailerNotConfiguredError,
  type MailMessage,
  type MailProvider,
} from './types'

/** Remetente. `AUTH_EMAIL_FROM` é o nome legado, aceito para compatibilidade. */
const from = serverEnv.MAIL_FROM ?? serverEnv.AUTH_EMAIL_FROM

const canUseResend = Boolean(serverEnv.RESEND_API_KEY && from)
const canUseSmtp = Boolean(serverEnv.AUTH_EMAIL_SERVER && from)

/**
 * Escolhe o provedor ativo.
 *
 * `MAIL_PROVIDER` manda quando informado — e se o escolhido não estiver
 * configurado, o erro é imediato, em vez de cair num fallback que a pessoa
 * não pediu. Sem a variável, detecta na ordem resend → smtp → console.
 */
function resolveProvider(): MailProvider | null {
  const explicit = serverEnv.MAIL_PROVIDER

  if (explicit === 'console') return createConsoleProvider()

  if (explicit === 'resend') {
    if (!canUseResend) return null
    return createResendProvider(serverEnv.RESEND_API_KEY!, from!)
  }

  if (explicit === 'smtp') {
    if (!canUseSmtp) return null
    return createSmtpProvider(serverEnv.AUTH_EMAIL_SERVER!, from!)
  }

  if (canUseResend)
    return createResendProvider(serverEnv.RESEND_API_KEY!, from!)
  if (canUseSmtp) return createSmtpProvider(serverEnv.AUTH_EMAIL_SERVER!, from!)

  // Nada configurado: só serve fora de produção (ver `assertMailerConfigured`).
  return createConsoleProvider()
}

let cached: MailProvider | null | undefined

function getProvider(): MailProvider | null {
  if (cached === undefined) {
    cached = resolveProvider()
    if (cached) {
      logger.info('Provedor de e-mail ativo', { provider: cached.name })
    }
  }
  return cached
}

/** `true` se há um provedor que realmente entrega mensagem neste ambiente. */
export function isMailerConfigured(): boolean {
  const provider = getProvider()
  return provider !== null && provider.name !== 'console'
}

/**
 * Garante que dá para enviar e-mail neste ambiente, sem enviar nada.
 *
 * Chame ANTES de qualquer consulta que dependa da existência de uma conta:
 * se o erro de configuração só aparecesse para contas existentes, ele viraria
 * um oráculo de enumeração (SEC-10).
 */
export function assertMailerConfigured(): void {
  if (serverEnv.NODE_ENV !== 'production') return
  if (!isMailerConfigured()) throw new MailerNotConfiguredError()
}

/**
 * Envia um e-mail pelo provedor ativo.
 *
 * Em produção sem provedor real, lança em vez de descartar a mensagem: e-mail
 * que some em silêncio deixa a pessoa travada sem nenhum sinal de erro.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  const provider = getProvider()

  if (
    !provider ||
    (provider.name === 'console' && serverEnv.NODE_ENV === 'production')
  ) {
    throw new MailerNotConfiguredError()
  }

  await provider.send(message)
}

/** Apenas para teste: descarta o provedor memoizado. */
export function resetMailProviderCache(): void {
  cached = undefined
}
