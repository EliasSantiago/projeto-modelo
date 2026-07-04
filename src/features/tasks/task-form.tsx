'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { createTaskAction } from '@/actions/task.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTaskSchema, type CreateTaskInput } from '@/schemas/task.schema'

/**
 * Formulário de criação de task. Valida com Zod no cliente (RHF) e a Server
 * Action revalida com o MESMO schema no servidor — dupla validação (RF-04).
 */
export function TaskForm() {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { title: '' },
  })

  function onSubmit(values: CreateTaskInput) {
    startTransition(async () => {
      const result = await createTaskAction(values)
      if (result.ok) {
        reset()
      } else {
        setError('title', { message: result.error })
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2"
      noValidate
    >
      <div className="flex gap-2">
        <Input
          {...register('title')}
          placeholder="Nova tarefa..."
          aria-invalid={Boolean(errors.title)}
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </div>
      {errors.title && (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {errors.title.message}
        </p>
      )}
    </form>
  )
}
