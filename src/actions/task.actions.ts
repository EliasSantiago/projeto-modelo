'use server'

import { refresh } from 'next/cache'
import { authAction } from '@/lib/safe-action'
import { taskService } from '@/services/task.service'
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from '@/schemas/task.schema'

/**
 * Server Actions da feature `tasks`. Cada action é envolvida por `authAction`,
 * que valida (Zod) e autoriza (sessão) antes de tocar em `taskService`.
 *
 * ## Por que `refresh()` e não `revalidatePath()`
 *
 * A lista de tarefas é dado por-usuário e NÃO é cacheada (ver `lib/cache.ts`):
 * não existe entrada de cache para invalidar, só a cópia que o cliente já
 * baixou. `refresh()` é exatamente isso — re-renderiza o conteúdo dinâmico da
 * página atual e deixa o shell estático intacto.
 *
 * `revalidatePath(ROUTES.dashboard)` também atualizaria a tela, mas derrubaria
 * o prerender da rota inteira (widgets, gráficos, textos que ninguém mudou)
 * para refletir a lista de um usuário só. Com `cacheComponents` ligado, esse
 * shell é justamente o que o CDN serve de graça — ver `docs/caching.md`.
 */
export const createTaskAction = authAction(
  createTaskSchema,
  async (input, { user }) => {
    const task = await taskService.create(user.id, input)
    refresh()
    return task
  },
)

export const updateTaskAction = authAction(
  updateTaskSchema,
  async (input, { user }) => {
    const task = await taskService.update(user.id, input)
    refresh()
    return task
  },
)

export const deleteTaskAction = authAction(
  taskIdSchema,
  async (input, { user }) => {
    await taskService.remove(user.id, input.id)
    refresh()
    return { id: input.id }
  },
)
