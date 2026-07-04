import { Suspense } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { TaskForm } from '@/features/tasks/task-form'
import { TaskList } from '@/features/tasks/task-list'
import { getCurrentUser } from '@/lib/session'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const demoTasks = [
  { title: 'Ler o README do projeto modelo', completed: true },
  { title: 'Configurar variáveis de ambiente', completed: false },
  { title: 'Rodar as migrações do banco', completed: false },
]

function TaskListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-11 animate-pulse rounded-xl bg-[var(--color-muted)]"
        />
      ))}
    </div>
  )
}

/** Demo estático (visitantes) — a feature real exige login. */
function DemoTasks() {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {demoTasks.map((task) => (
          <li
            key={task.title}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2"
          >
            <CheckCircleIcon
              className={cn(
                'size-5',
                task.completed
                  ? 'text-brand-500 dark:text-white'
                  : 'text-navy-300',
              )}
              aria-hidden
            />
            <span
              className={cn(
                'flex-1 text-sm',
                task.completed && 'text-navy-400 line-through',
              )}
            >
              {task.title}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-navy-400 text-sm">
        Exemplo de demonstração.{' '}
        <Link
          href={ROUTES.login}
          className="text-brand-500 hover:text-brand-700 dark:text-navy-100 font-medium dark:hover:text-white"
        >
          Entre
        </Link>{' '}
        para criar e gerenciar suas tarefas de verdade.
      </p>
    </div>
  )
}

/**
 * Seção de tarefas do dashboard. Com sessão, mostra a feature funcional
 * (Server Actions + banco); sem sessão, um demo estático (páginas de exemplo
 * são públicas para documentação).
 */
export async function TaskSection() {
  const user = await getCurrentUser()
  if (!user) return <DemoTasks />

  return (
    <div className="flex flex-col gap-6">
      <TaskForm />
      <Suspense fallback={<TaskListSkeleton />}>
        <TaskList />
      </Suspense>
    </div>
  )
}
