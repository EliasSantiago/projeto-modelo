'use client'

import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useMounted } from '@/hooks/use-mounted'

const OPTIONS = [
  { value: 'light', label: 'Claro', Icon: SunIcon },
  { value: 'dark', label: 'Escuro', Icon: MoonIcon },
  { value: 'system', label: 'Sistema', Icon: ComputerDesktopIcon },
] as const

/**
 * Seletor de tema com três opções (claro, escuro, sistema) em um controle
 * segmentado. Usa `theme` (a preferência escolhida, não o resolvido) para
 * refletir "Sistema" corretamente. O destaque só aparece após o mount para
 * evitar hydration mismatch.
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const active = mounted ? (theme ?? 'system') : undefined

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="bg-surface-3 inline-flex items-center gap-1 rounded-full p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = active === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              selected
                ? 'bg-surface text-ink shadow-[var(--rail-hover-shadow)]'
                : 'text-ink-3 hover:text-ink',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
