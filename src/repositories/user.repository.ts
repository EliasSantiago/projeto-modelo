import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { users, type NewUser, type User } from '@/db/schema'

/** Único acesso ao Drizzle para `users`. Queries parametrizadas (SEC-05). */
export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    return row ?? null
  },

  async findById(id: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return row ?? null
  },

  async create(data: NewUser): Promise<User> {
    const [row] = await db.insert(users).values(data).returning()
    return row!
  },

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId))
  },

  /** Marca o endereço como confirmado. Idempotente: reconfirmar não quebra. */
  async markEmailVerified(
    userId: string,
    at: Date = new Date(),
  ): Promise<void> {
    await db
      .update(users)
      .set({ emailVerified: at })
      .where(eq(users.id, userId))
  },
}
