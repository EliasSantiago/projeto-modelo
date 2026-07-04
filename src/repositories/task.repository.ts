import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { tasks, type NewTask, type Task } from '@/db/schema'

/**
 * ÚNICA camada que fala com o Drizzle para `tasks`. Todas as queries são
 * parametrizadas pelo query builder (SEC-05). Todo filtro inclui `userId`
 * para nunca expor dados de outro usuário.
 */
export const taskRepository = {
  findManyByUser(userId: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt))
  },

  async findByIdForUser(id: string, userId: string): Promise<Task | null> {
    const [row] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .limit(1)
    return row ?? null
  },

  async create(data: NewTask): Promise<Task> {
    const [row] = await db.insert(tasks).values(data).returning()
    return row!
  },

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<Task, 'title' | 'completed'>>,
  ): Promise<Task | null> {
    const [row] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning()
    return row ?? null
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning({ id: tasks.id })
    return rows.length > 0
  },
}
