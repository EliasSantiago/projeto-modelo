'use server'

import { revalidatePath } from 'next/cache'
import { authAction } from '@/lib/safe-action'
import { taskService } from '@/services/task.service'
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from '@/schemas/task.schema'
import { ROUTES } from '@/constants/routes'

/**
 * Server Actions da feature `tasks`. Cada action é envolvida por `authAction`,
 * que valida (Zod) e autoriza (sessão) antes de tocar em `taskService`.
 * `revalidatePath` atualiza a UI após a mutação.
 */
export const createTaskAction = authAction(
  createTaskSchema,
  async (input, { user }) => {
    const task = await taskService.create(user.id, input)
    revalidatePath(ROUTES.dashboard)
    return task
  },
)

export const updateTaskAction = authAction(
  updateTaskSchema,
  async (input, { user }) => {
    const task = await taskService.update(user.id, input)
    revalidatePath(ROUTES.dashboard)
    return task
  },
)

export const deleteTaskAction = authAction(
  taskIdSchema,
  async (input, { user }) => {
    await taskService.remove(user.id, input.id)
    revalidatePath(ROUTES.dashboard)
    return { id: input.id }
  },
)
