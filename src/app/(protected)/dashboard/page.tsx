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
import { getCurrentUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Dashboard' }

function TaskListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-md bg-[var(--color-muted)]"
        />
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Olá, {user?.name ?? 'usuário'} 👋</CardTitle>
          <CardDescription>
            Suas tarefas — criadas, atualizadas e removidas via Server Actions
            com validação e autorização.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <TaskForm />
          {/* Streaming: o shell aparece na hora; a lista chega em seguida. */}
          <Suspense fallback={<TaskListSkeleton />}>
            <TaskList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
