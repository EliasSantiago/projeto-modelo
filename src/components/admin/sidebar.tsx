'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ADMIN_NAV } from '@/constants/nav'
import { APP } from '@/constants/app'
import { cn } from '@/lib/utils'

/** Sidebar do admin shell (estilo Horizon): marca + navegação com item ativo. */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="dark:bg-navy-800 flex h-full w-72 flex-col bg-white">
      <div className="flex items-center justify-between px-8 py-8">
        <span className="text-navy-700 text-2xl font-bold dark:text-white">
          {APP.name}
        </span>
        {onNavigate && (
          <button
            onClick={onNavigate}
            aria-label="Fechar menu"
            className="text-navy-400 lg:hidden"
          >
            <XMarkIcon className="size-6" />
          </button>
        )}
      </div>

      <div className="mx-auto mb-6 h-px w-4/5 bg-[var(--color-border)]" />

      <nav className="flex flex-col gap-1 px-4">
        {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === href
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors',
                active
                  ? 'text-navy-700 font-bold dark:text-white'
                  : 'text-navy-400 hover:text-navy-700 font-medium dark:hover:text-white',
              )}
            >
              <Icon
                className={cn(
                  'size-5',
                  active ? 'text-brand-500 dark:text-white' : 'text-navy-400',
                )}
                aria-hidden
              />
              {label}
              {active && (
                <span className="bg-brand-500 dark:bg-brand-400 absolute top-1/2 right-0 h-9 w-1 -translate-y-1/2 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
