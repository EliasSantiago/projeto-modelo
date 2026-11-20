'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Label({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-ink-2 text-[13px] leading-none font-medium peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}

/** Campo de formulário: rótulo, controle, dica e erro. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: ReactNode
  htmlFor?: string
  hint?: ReactNode
  error?: string | string[]
  className?: string
  children: ReactNode
}) {
  const message = Array.isArray(error) ? error[0] : error
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {message ? (
        <p className="text-danger text-xs" role="alert">
          {message}
        </p>
      ) : hint ? (
        <p className="text-ink-3 text-xs">{hint}</p>
      ) : null}
    </div>
  )
}
