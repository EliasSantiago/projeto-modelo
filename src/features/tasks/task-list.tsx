import { requireUser } from '@/lib/session'
import { taskService } from '@/services/task.service'
import { TaskItem } from '@/features/tasks/task-item'

/**
 * Lista de tasks do usuário. Server Component assíncrono, busca os dados no
 * servidor e é renderizado dentro de um <Suspense> para streaming (RF-06).
 */
export async function TaskList() {
  const user = await requireUser()
  const tasks = await taskService.list(user.id)

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]">
        Nenhuma tarefa ainda. Adicione a primeira acima.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}
