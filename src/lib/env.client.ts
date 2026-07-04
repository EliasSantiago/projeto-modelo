import { z } from 'zod'

/**
 * Variáveis PÚBLICAS (expostas ao browser). Somente prefixo NEXT_PUBLIC_.
 * Precisam ser referenciadas de forma estática para o Next inliná-las no bundle.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('Projeto Modelo'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
})

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})

if (!parsed.success) {
  throw new Error('Variáveis NEXT_PUBLIC_* inválidas')
}

export const clientEnv = parsed.data
