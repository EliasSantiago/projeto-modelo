import 'server-only'
import { serverEnv } from '@/lib/env.server'

/**
 * Log estruturado do servidor.
 *
 * `console.error` solto resolve em dev e desaparece em produção: sem campo
 * consultável, um erro vira texto perdido no meio do stdout. Aqui a saída é
 * JSON de uma linha em produção (o formato que agregadores esperam) e legível
 * em dev.
 *
 * Zero dependência de propósito: um starter não deve obrigar ninguém a criar
 * conta em serviço de observabilidade para rodar. O gancho `onError` é o
 * ponto de plugagem, veja o exemplo de Sentry no fim do arquivo.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** Campos estruturados anexados ao log. Nunca coloque secret aqui. */
export type LogContext = Record<string, unknown>

/**
 * Chaves cujo valor é sempre mascarado, em qualquer profundidade.
 * Rede de segurança, não licença: o certo continua sendo não passar o dado.
 */
const REDACTED_KEYS = new Set([
  'password',
  'passwordhash',
  'senha',
  'token',
  'tokenhash',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'secret',
  'authorization',
  'cookie',
  'sessiontoken',
  'apikey',
  'databaseurl',
])

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

// Em produção o ruído de debug não paga o custo de armazenamento.
const MIN_LEVEL: LogLevel =
  serverEnv.NODE_ENV === 'production' ? 'info' : 'debug'

function redact(value: unknown, depth = 0): unknown {
  if (depth > 6 || value === null || typeof value !== 'object') return value

  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1))

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value)) {
    out[key] = REDACTED_KEYS.has(key.toLowerCase())
      ? '[REDACTED]'
      : redact(val, depth + 1)
  }
  return out
}

/** Extrai o que interessa de um erro sem perder a cadeia de `cause`. */
function serializeError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { error: String(error) }

  return {
    name: error.name,
    message: error.message,
    // Stack só fora de produção: em log agregado ela é ruído caro, e o
    // agregador (Sentry & cia.) já captura a sua própria.
    ...(serverEnv.NODE_ENV === 'production' ? {} : { stack: error.stack }),
    ...(error.cause ? { cause: serializeError(error.cause) } : {}),
  }
}

/**
 * Gancho para reportar erros a um serviço externo. Por padrão não faz nada.
 * Preencha uma única vez, no boot do servidor (ex.: `instrumentation.ts`).
 */
let onError: ((error: unknown, context: LogContext) => void) | null = null

export function setErrorReporter(
  reporter: (error: unknown, context: LogContext) => void,
): void {
  onError = reporter
}

function emit(level: LogLevel, message: string, context: LogContext): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return

  const safeContext = redact(context) as LogContext

  if (serverEnv.NODE_ENV === 'production') {
    // Uma linha por evento: é o que agregador de log sabe consumir.
    console[level === 'debug' ? 'log' : level](
      JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        ...safeContext,
      }),
    )
    return
  }

  const hasContext = Object.keys(safeContext).length > 0
  console[level === 'debug' ? 'log' : level](
    `[${level.toUpperCase()}] ${message}`,
    ...(hasContext ? [safeContext] : []),
  )
}

export const logger = {
  debug: (message: string, context: LogContext = {}) =>
    emit('debug', message, context),

  info: (message: string, context: LogContext = {}) =>
    emit('info', message, context),

  warn: (message: string, context: LogContext = {}) =>
    emit('warn', message, context),

  /**
   * Registra um erro e o encaminha ao reporter, se houver.
   * O reporter nunca derruba o fluxo: falha nele vira log e segue.
   */
  error: (message: string, error?: unknown, context: LogContext = {}) => {
    emit('error', message, {
      ...context,
      ...(error !== undefined ? { err: serializeError(error) } : {}),
    })

    if (error !== undefined && onError) {
      try {
        onError(error, context)
      } catch (reporterError) {
        emit('warn', 'Falha ao reportar erro ao serviço externo', {
          err: serializeError(reporterError),
        })
      }
    }
  },
}

/**
 * Para ligar o Sentry (ou equivalente), crie `src/instrumentation.ts`:
 *
 * ```ts
 * import { setErrorReporter } from '@/lib/logger'
 *
 * export async function register() {
 *   const Sentry = await import('@sentry/nextjs')
 *   Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 })
 *   setErrorReporter((error, context) => {
 *     Sentry.captureException(error, { extra: context })
 *   })
 * }
 * ```
 *
 * O Next chama `register()` uma vez por processo, antes de servir requisição.
 */
