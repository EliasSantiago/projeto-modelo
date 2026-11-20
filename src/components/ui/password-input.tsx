'use client'

import { useState, type ComponentProps } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Botão de olho para mostrar/ocultar um valor secreto. `what` entra no
 * rótulo acessível: "Mostrar senha", "Ocultar token"…
 */
export function RevealButton({
  shown,
  onToggle,
  what = 'senha',
  className,
}: {
  shown: boolean
  onToggle: () => void
  what?: string
  className?: string
}) {
  const Icon = shown ? EyeSlashIcon : EyeIcon
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${shown ? 'Ocultar' : 'Mostrar'} ${what}`}
      aria-pressed={shown}
      title={`${shown ? 'Ocultar' : 'Mostrar'} ${what}`}
      className={cn(
        'text-ink-3 hover:text-ink hover:bg-surface-3 inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors',
        className,
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}

/** `<Input type="password">` com o olho para mostrar o que foi digitado. */
export function PasswordInput({
  className,
  what = 'senha',
  ...props
}: Omit<ComponentProps<'input'>, 'type'> & { what?: string }) {
  const [shown, setShown] = useState(false)
  return (
    <div className="relative">
      <Input
        {...props}
        type={shown ? 'text' : 'password'}
        className={cn('pr-10', className)}
      />
      <RevealButton
        shown={shown}
        onToggle={() => setShown((s) => !s)}
        what={what}
        className="absolute top-1/2 right-1 -translate-y-1/2"
      />
    </div>
  )
}
