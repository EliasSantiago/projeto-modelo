import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type AuthInputProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

/** Campo de formulário: label acima + input arredondado (rounded-xl). */
export function AuthInput({
  label,
  error,
  id,
  name,
  className,
  ...props
}: AuthInputProps) {
  const inputId = id ?? name
  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="text-navy-700 ml-1.5 text-sm font-medium dark:text-white"
      >
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={Boolean(error)}
        className={cn(
          'placeholder:text-navy-200 mt-2 flex h-12 w-full items-center rounded-xl border bg-white/0 p-3 text-sm outline-none dark:text-white',
          error
            ? 'border-red-500 text-red-500 placeholder:text-red-400'
            : 'focus:border-brand-400 border-[var(--color-input)] dark:border-white/10',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 ml-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
