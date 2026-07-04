import 'server-only'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db/client'
import { passwordResetTokens } from '@/db/schema'

/** Acesso ao Drizzle para tokens de recuperação de senha. */
export const passwordResetRepository = {
  async create(userId: string, tokenHash: string, expires: Date) {
    await db.insert(passwordResetTokens).values({ userId, tokenHash, expires })
  },

  async findValid(tokenHash: string) {
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expires, new Date()),
        ),
      )
      .limit(1)
    return row ?? null
  },

  async deleteForUser(userId: string) {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, userId))
  },
}
