import 'server-only'
import { headers } from 'next/headers'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { serverEnv } from '@/lib/env.server'

/**
 * Rate limiting para endpoints públicos (login, cadastro, recuperação de
 * senha). Sem isso, força bruta de senha e bombardeio de e-mail saem de graça
 * — OWASP A07, citado pela constituição como referência viva.
 *
 * Dois backends:
 *  - Upstash Redis, quando UPSTASH_REDIS_REST_* estão definidas. É o único
 *    correto em serverless, onde cada requisição pode cair numa instância
 *    diferente;
 *  - contador em memória, como fallback. Serve para dev funcionar sem
 *    cadastro em serviço nenhum. Em produção ele avisa alto: por instância,
 *    o limite real vira `N × instâncias`.
 */

export type RateLimitResult = {
  success: boolean
  /** Segundos até a janela liberar. 0 quando a requisição passou. */
  retryAfter: number
}

/** Janelas por bucket. Ajuste conforme o perfil de tráfego do produto. */
export const RATE_LIMITS = {
  /** Login: tolera erro de digitação, corta força bruta. */
  login: { tokens: 8, window: '5 m' },
  /** Cadastro: evita criação de contas em massa por um mesmo IP. */
  register: { tokens: 5, window: '1 h' },
  /** Recuperação de senha: evita usar o app como bomba de e-mail. */
  passwordReset: { tokens: 4, window: '1 h' },
} as const

export type RateLimitBucket = keyof typeof RATE_LIMITS

const usingRedis = Boolean(
  serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN,
)

let warnedAboutMemory = false

function warnIfMemoryInProduction(): void {
  if (usingRedis || warnedAboutMemory) return
  warnedAboutMemory = true
  if (serverEnv.NODE_ENV === 'production') {
    console.warn(
      '[rate-limit] UPSTASH_REDIS_REST_* ausentes: usando contador em ' +
        'memória. Em serverless o limite NÃO é compartilhado entre ' +
        'instâncias e a proteção fica parcial. Configure o Redis.',
    )
  }
}

// --- Backend Upstash -----------------------------------------------------
const redisLimiters = new Map<RateLimitBucket, Ratelimit>()

function redisLimiter(bucket: RateLimitBucket): Ratelimit {
  let limiter = redisLimiters.get(bucket)
  if (!limiter) {
    const { tokens, window } = RATE_LIMITS[bucket]
    limiter = new Ratelimit({
      redis: new Redis({
        url: serverEnv.UPSTASH_REDIS_REST_URL!,
        token: serverEnv.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(tokens, window),
      prefix: `rl:${bucket}`,
      analytics: false,
    })
    redisLimiters.set(bucket, limiter)
  }
  return limiter
}

// --- Backend em memória --------------------------------------------------
const WINDOW_MS: Record<string, number> = {
  '5 m': 5 * 60_000,
  '1 h': 60 * 60_000,
}

const memoryHits = new Map<string, number[]>()

function memoryLimit(bucket: RateLimitBucket, key: string): RateLimitResult {
  const { tokens, window } = RATE_LIMITS[bucket]
  const windowMs = WINDOW_MS[window] ?? 60_000
  const now = Date.now()

  const hits = (memoryHits.get(key) ?? []).filter((at) => now - at < windowMs)

  if (hits.length >= tokens) {
    memoryHits.set(key, hits)
    const oldest = hits[0]!
    return {
      success: false,
      retryAfter: Math.ceil((windowMs - (now - oldest)) / 1000),
    }
  }

  hits.push(now)
  memoryHits.set(key, hits)

  // Poda preguiçosa: sem isso o Map cresce sem limite num processo longo.
  if (memoryHits.size > 10_000) {
    for (const [k, v] of memoryHits) {
      if (v.every((at) => now - at >= windowMs)) memoryHits.delete(k)
    }
  }

  return { success: true, retryAfter: 0 }
}

/** IP do cliente a partir dos headers do proxy. */
async function clientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return h.get('x-real-ip') ?? 'unknown'
}

/**
 * Aplica o limite do bucket ao IP de origem.
 *
 * `discriminator` opcional estreita a chave (ex.: o e-mail informado), para
 * que um atacante num único IP não consiga travar o login de terceiros
 * gastando a cota compartilhada.
 *
 * Falha ABERTO: se o Redis estiver fora, a requisição passa. Derrubar o
 * login inteiro porque o limitador caiu seria pior que o risco que ele cobre.
 */
export async function checkRateLimit(
  bucket: RateLimitBucket,
  discriminator?: string,
): Promise<RateLimitResult> {
  warnIfMemoryInProduction()

  const ip = await clientIp()
  const key = discriminator ? `${ip}:${discriminator.toLowerCase()}` : `${ip}`

  if (!usingRedis) return memoryLimit(bucket, `${bucket}:${key}`)

  try {
    const { success, reset } = await redisLimiter(bucket).limit(key)
    return {
      success,
      retryAfter: success
        ? 0
        : Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    }
  } catch (error) {
    console.error('[rate-limit] Redis indisponível, liberando request:', error)
    return { success: true, retryAfter: 0 }
  }
}

/** Mensagem neutra para a UI, sem revelar nada sobre a conta alvo. */
export function rateLimitMessage(retryAfter: number): string {
  const minutes = Math.ceil(retryAfter / 60)
  return retryAfter > 90
    ? `Muitas tentativas. Tente novamente em ${minutes} minutos.`
    : 'Muitas tentativas. Aguarde um momento e tente novamente.'
}
