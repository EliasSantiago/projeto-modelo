import 'server-only'
import { z } from 'zod'

/**
 * Variáveis de ambiente do SERVIDOR. Este módulo importa `server-only`:
 * qualquer tentativa de importá-lo em código de cliente quebra o build,
 * garantindo que secrets nunca entrem no bundle do browser (SEC-01).
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),

  AUTH_SECRET: z
    .string()
    .min(1, 'AUTH_SECRET é obrigatório (gere com `npx auth secret`)'),
  AUTH_URL: z.string().url().optional(),

  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  AUTH_EMAIL_SERVER: z.string().optional(),
  AUTH_EMAIL_FROM: z.string().optional(),

  // Rate limiting distribuído (Upstash Redis). Sem estas variáveis o
  // limitador cai para um contador em memória, adequado só a dev.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
})

const parsed = serverEnvSchema.safeParse(process.env)

if (!parsed.success) {
  // Log detalhado só no servidor; nunca exposto ao cliente (SEC-07).
  console.error(
    '❌ Variáveis de ambiente do servidor inválidas:',
    z.flattenError(parsed.error).fieldErrors,
  )
  throw new Error('Configuração de ambiente inválida. Verifique o .env.local')
}

export const serverEnv = parsed.data
