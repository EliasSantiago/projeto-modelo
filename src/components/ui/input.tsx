import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const fieldClass =
  'flex w-full min-w-0 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-base sm:text-sm text-ink placeholder:text-ink-3 transition-colors hover:border-ink-3 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[color-mix(in_oklab,var(--accent)_22%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(fieldClass, 'h-9 py-1.5', className)}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(fieldClass, 'min-h-20 py-2 leading-relaxed', className)}
      {...props}
    />
  )
}
