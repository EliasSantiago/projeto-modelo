'use client'

import { TrashIcon } from '@heroicons/react/24/outline'
import { useTransition } from 'react'
import { deleteTaskAction, updateTaskAction } from '@/actions/task.actions'
import { Button } from '@/components/ui/button'
import type { Task } from '@/db/schema'
import { cn } from '@/lib/utils'

/** Item da lista de tasks: alterna conclusão e remove (Server Actions). */
export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await updateTaskAction({ id: task.id, completed: !task.completed })
    })
  }

  function remove() {
    startTransition(async () => {
      await deleteTaskAction({ id: task.id })
    })
  }

  return (
    <li className="flex items-center gap-3 rounded-md border border-[var(--color-border)] px-3 py-2">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={toggle}
        disabled={isPending}
        aria-label={`Marcar "${task.title}" como concluída`}
        className="size-4"
      />
      <span
        className={cn(
          'flex-1 text-sm',
          task.completed && 'text-[var(--color-muted-foreground)] line-through',
        )}
      >
        {task.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={remove}
        disabled={isPending}
        aria-label={`Remover "${task.title}"`}
      >
        <TrashIcon aria-hidden />
      </Button>
    </li>
  )
}
