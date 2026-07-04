import { z } from 'zod'

/**
 * Fonte da verdade de validação E tipos da feature `tasks`.
 * Usado no cliente (RHF) e no servidor (Server Actions) — RF-04 / SEC-03.
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Informe um título')
    .max(200, 'Máximo de 200 caracteres'),
})

export const updateTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200).optional(),
  completed: z.boolean().optional(),
})

export const taskIdSchema = z.object({
  id: z.string().min(1),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskIdInput = z.infer<typeof taskIdSchema>
