import 'server-only'
import { taskRepository } from '@/repositories/task.repository'
import type { CreateTaskInput, UpdateTaskInput } from '@/schemas/task.schema'
import type { Task } from '@/db/schema'

/**
 * Regras de negócio da feature `tasks`. Recebe sempre o `userId` do chamador
 * (já autenticado) e delega persistência ao repository. Reforça posse do
 * recurso, nunca opera fora do escopo do usuário (SEC-04).
 */
export class TaskNotFoundError extends Error {
  constructor() {
    super('Tarefa não encontrada')
    this.name = 'TaskNotFoundError'
  }
}

export const taskService = {
  list(userId: string): Promise<Task[]> {
    return taskRepository.findManyByUser(userId)
  },

  create(userId: string, input: CreateTaskInput): Promise<Task> {
    return taskRepository.create({ userId, title: input.title })
  },

  async update(userId: string, input: UpdateTaskInput): Promise<Task> {
    const updated = await taskRepository.update(input.id, userId, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.completed !== undefined && { completed: input.completed }),
    })
    if (!updated) throw new TaskNotFoundError()
    return updated
  },

  async remove(userId: string, id: string): Promise<void> {
    const ok = await taskRepository.delete(id, userId)
    if (!ok) throw new TaskNotFoundError()
  },
}
