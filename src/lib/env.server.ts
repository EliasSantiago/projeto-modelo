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

  // Sinais de que o Auth.js pode confiar no header `Host` da requisição.
  // Ele recusa (`UntrustedHost`) quando roda em produção sem nenhum deles,
  // porque derivar a URL de callback de um header que o cliente controla é
  // como um atacante redireciona o fluxo de OAuth para o domínio dele.
  // `VERCEL` e `CF_PAGES` são injetadas pelas próprias plataformas.
  AUTH_TRUST_HOST: z.string().optional(),
  VERCEL: z.string().optional(),
  CF_PAGES: z.string().optional(),

  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  // --- E-mail ------------------------------------------------------------
  // Provedor explícito. Ausente, `lib/mail` detecta pelo que estiver
  // configurado: resend → smtp → console.
  MAIL_PROVIDER: z.enum(['resend', 'smtp', 'console']).optional(),
  // Remetente, ex.: "Projeto Modelo <no-reply@seudominio.com>".
  MAIL_FROM: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  // SMTP (alternativa ao Resend). `AUTH_EMAIL_FROM` é o nome legado de
  // `MAIL_FROM`, mantido para não quebrar quem já tinha o .env preenchido.
  AUTH_EMAIL_SERVER: z.string().optional(),
  AUTH_EMAIL_FROM: z.string().optional(),

  // Rate limiting distribuído (Upstash Redis). Sem estas variáveis o
  // limitador cai para um contador em memória, adequado só a dev.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
})

const parsed = serverEnvSchema.safeParse(process.env)

if (!parsed.success) {
  // `console` de propósito: o logger depende deste módulo, então ainda não
  // existe neste ponto. Detalhe fica só no servidor (SEC-07).
  console.error(
    '❌ Variáveis de ambiente do servidor inválidas:',
    z.flattenError(parsed.error).fieldErrors,
  )
  throw new Error('Configuração de ambiente inválida. Verifique o .env.local')
}

export const serverEnv = parsed.data

/**
 * `true` quando o Auth.js vai aceitar o header `Host` neste ambiente.
 *
 * Reproduz a regra do `@auth/core`: fora de produção ele confia por padrão;
 * em produção exige `AUTH_URL`, `AUTH_TRUST_HOST` ou uma plataforma
 * conhecida. Sem isso, toda chamada a `auth()` estoura com `UntrustedHost` —
 * um erro que aparece só depois do deploy e cuja causa não é óbvia.
 * `instrumentation.ts` avisa no boot; ver `.env.example`.
 */
export const authHostIsTrusted =
  serverEnv.NODE_ENV !== 'production' ||
  Boolean(
    serverEnv.AUTH_URL ??
    serverEnv.AUTH_TRUST_HOST ??
    serverEnv.VERCEL ??
    serverEnv.CF_PAGES,
  )
