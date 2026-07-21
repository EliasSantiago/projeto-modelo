import 'server-only'
import { z } from 'zod'
import { getCurrentUser, hasRole, type SessionUser } from '@/lib/session'
import type { UserRole } from '@/db/schema'

/**
 * Resultado padronizado das Server Actions consumido pela UI.
 * Nunca carrega stack trace ou detalhe interno (SEC-07).
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

type AuthedHandler<TInput, TOutput> = (
  input: TInput,
  ctx: { user: SessionUser },
) => Promise<TOutput>

/**
 * Envolve uma Server Action garantindo, em ordem:
 *  1. Autenticação (SEC-04);
 *  2. Validação de entrada com Zod (SEC-03);
 *  3. Execução com tratamento de erro que não vaza dados sensíveis (SEC-07).
 */
export function authAction<TSchema extends z.ZodType, TOutput>(
  schema: TSchema,
  handler: AuthedHandler<z.infer<TSchema>, TOutput>,
  options: { role?: UserRole } = {},
) {
  return async (input: z.infer<TSchema>): Promise<ActionResult<TOutput>> => {
    const user = await getCurrentUser()
    if (!user) {
      return { ok: false, error: 'Não autorizado' }
    }

    // Mesma mensagem de "não autorizado" para papel insuficiente: distinguir
    // os dois casos confirmaria a um usuário comum que a action existe e o
    // que ela exige.
    if (options.role && !hasRole(user, options.role)) {
      return { ok: false, error: 'Não autorizado' }
    }

    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Dados inválidos',
        fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
          string,
          string[]
        >,
      }
    }

    try {
      const data = await handler(parsed.data, { user })
      return { ok: true, data }
    } catch (err) {
      // Log detalhado só no servidor; cliente recebe mensagem genérica.
      console.error('[authAction] erro:', err)
      const message =
        err instanceof Error && err.name === 'TaskNotFoundError'
          ? err.message
          : 'Não foi possível concluir a operação'
      return { ok: false, error: message }
    }
  }
}

/**
 * Server Action restrita a administradores. Açúcar sobre `authAction` para
 * que a intenção fique legível no ponto de uso:
 *
 *   export const banUserAction = adminAction(banUserSchema, async (input) => …)
 */
export function adminAction<TSchema extends z.ZodType, TOutput>(
  schema: TSchema,
  handler: AuthedHandler<z.infer<TSchema>, TOutput>,
) {
  return authAction(schema, handler, { role: 'admin' })
}
