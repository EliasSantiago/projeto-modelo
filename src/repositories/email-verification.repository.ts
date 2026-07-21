import 'server-only'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db/client'
import { emailVerificationTokens } from '@/db/schema'

/** Única camada com Drizzle para convites de confirmação de e-mail. */
export const emailVerificationRepository = {
  async create(userId: string, tokenHash: string, expires: Date) {
    await db
      .insert(emailVerificationTokens)
      .values({ userId, tokenHash, expires })
  },

  /** Só devolve token não expirado: a validade é conferida na query (SEC-15). */
  async findValid(tokenHash: string) {
    const [row] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          gt(emailVerificationTokens.expires, new Date()),
        ),
      )
      .limit(1)
    return row ?? null
  },

  async deleteForUser(userId: string) {
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId))
  },
}
