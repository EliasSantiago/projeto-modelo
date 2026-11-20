import { APP } from '@/constants/app'
import { cn } from '@/lib/utils'

/** Selo da marca: quadrado grafite em degradê com a inicial do app. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'surface-graphite inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-xs)] text-[15px] font-semibold',
        className,
      )}
    >
      {APP.name.slice(0, 1).toUpperCase()}
    </span>
  )
}

/** Logo completo: selo + nome do app. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'text-ink inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em]',
        className,
      )}
    >
      <LogoMark />
      <span className="truncate">{APP.name}</span>
    </span>
  )
}
