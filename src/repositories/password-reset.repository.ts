import 'server-only'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db/client'
import { passwordResetTokens } from '@/db/schema'

/** Acesso ao Drizzle para tokens de recuperação de senha. */
export const passwordResetRepository = {
  async create(userId: string, tokenHash: string, expires: Date) {
    await db.insert(passwordResetTokens).values({ userId, tokenHash, expires })
  },

  /**
   * Consome o token: apaga e devolve a linha numa única instrução, e só se
   * ele ainda estiver válido (SEC-15).
   *
   * Ler e apagar em passos separados abre uma corrida: duas requisições com
   * o mesmo link passariam ambas pela leitura antes de qualquer uma apagar,
   * e o token "de uso único" seria usado duas vezes. Com `DELETE … RETURNING`
   * o banco garante que só uma delas recebe a linha.
   */
  async consumeValid(tokenHash: string) {
    const [row] = await db
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expires, new Date()),
        ),
      )
      .returning()
    return row ?? null
  },

  async deleteForUser(userId: string) {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, userId))
  },
}
