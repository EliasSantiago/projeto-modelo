import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { StatWidget } from '@/components/ui/stat-widget'
import { requireUser } from '@/lib/session'
import { taskService } from '@/services/task.service'

/** Linha de métricas do dashboard (Server Component, streamed via Suspense). */
export async function TaskStats() {
  const user = await requireUser()
  const tasks = await taskService.list(user.id)

  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const pending = total - completed

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatWidget
        icon={ClipboardDocumentListIcon}
        label="Total"
        value={total}
      />
      <StatWidget icon={CheckCircleIcon} label="Concluídas" value={completed} />
      <StatWidget icon={ClockIcon} label="Pendentes" value={pending} />
    </div>
  )
}

export function TaskStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-[88px] animate-pulse rounded-[20px] bg-[var(--color-muted)]"
        />
      ))}
    </div>
  )
}
