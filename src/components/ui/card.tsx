import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Card({
  className,
  variant = 'default',
  ...props
}: ComponentProps<'div'> & { variant?: 'default' | 'highlight' }) {
  return (
    <div
      className={cn(
        'border-line text-ink rounded-[var(--radius-lg)] border',
        variant === 'highlight'
          ? 'surface-highlight dark:surface-graphite'
          : 'surface-card',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 px-6 pt-5 pb-3',
        className,
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('text-[15px] font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-ink-3 text-[13px]', className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-6 pb-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-line flex items-center justify-end gap-2 border-t px-6 py-3.5',
        className,
      )}
      {...props}
    />
  )
}
