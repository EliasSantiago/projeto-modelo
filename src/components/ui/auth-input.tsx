'use client'

import { useState, type ComponentProps } from 'react'
import { fieldClass } from '@/components/ui/input'
import { RevealButton } from '@/components/ui/password-input'
import { cn } from '@/lib/utils'

type AuthInputProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

/**
 * Campo das telas de autenticação: rótulo acima + input.
 * `type="password"` ganha o olho para mostrar a senha digitada.
 */
export function AuthInput({
  label,
  error,
  id,
  name,
  className,
  type,
  ...props
}: AuthInputProps) {
  const inputId = id ?? name
  const errorId = error ? `${inputId}-erro` : undefined
  const isPassword = type === 'password'
  const [shown, setShown] = useState(false)
  return (
    <div className="mb-4 flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-ink-2 text-[13px] font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={isPassword && shown ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn(fieldClass, 'h-11', isPassword && 'pr-11', className)}
          {...props}
        />
        {isPassword && (
          <RevealButton
            shown={shown}
            onToggle={() => setShown((s) => !s)}
            className="absolute top-1/2 right-2 size-8 -translate-y-1/2"
          />
        )}
      </div>
      {error && (
        <p id={errorId} className="text-danger text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
