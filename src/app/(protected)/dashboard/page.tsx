import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TaskForm } from '@/features/tasks/task-form'
import { TaskList } from '@/features/tasks/task-list'
import { TaskStats, TaskStatsSkeleton } from '@/features/tasks/task-stats'
import { getCurrentUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Dashboard' }

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

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-navy-700 text-2xl font-bold dark:text-white">
          Olá, {user?.name ?? 'usuário'} 👋
        </h1>
        <p className="text-navy-200">Aqui está um resumo das suas tarefas.</p>
      </div>

      {/* Métricas — streamed via Suspense */}
      <div className="mb-6">
        <Suspense fallback={<TaskStatsSkeleton />}>
          <TaskStats />
        </Suspense>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minhas tarefas</CardTitle>
          <CardDescription>
            Criadas, atualizadas e removidas via Server Actions com validação e
            autorização.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <TaskForm />
          <Suspense fallback={<TaskListSkeleton />}>
            <TaskList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
