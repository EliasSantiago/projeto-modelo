'use client'

import { usePathname } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { UserMenu } from '@/components/admin/user-menu'
import { initialsOf } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { ADMIN_NAV } from '@/constants/nav'
import { ROUTES } from '@/constants/routes'
import type { SessionUser } from '@/lib/session'

/**
 * Barra superior do admin shell: translúcida sobre o fundo, com o título da
 * página atual, a alternância de tema e o menu da conta.
 */
export function Navbar({
  user,
  onMenuClick,
}: {
  user: SessionUser | null
  onMenuClick: () => void
}) {
  const pathname = usePathname()
  const current = ADMIN_NAV.find((item) =>
    item.href === ROUTES.dashboard
      ? pathname === item.href
      : pathname.startsWith(item.href),
  )
  const title = current?.label ?? 'Dashboard'

  return (
    <header className="bg-bg/85 sticky top-0 z-30 flex h-16 items-center gap-2 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Bars3Icon className="!size-5" />
      </Button>

      <div className="min-w-0">
        <p className="text-ink-3 truncate text-xs">Páginas / {title}</p>
        <h1 className="text-ink truncate text-lg leading-tight font-semibold tracking-[-0.02em]">
          {title}
        </h1>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <ThemeToggle />
        <UserMenu user={user} side="bottom" align="end">
          <button
            type="button"
            aria-label="Menu da conta"
            className="bg-accent-soft text-accent-soft-ink ml-1 flex size-9 items-center justify-center rounded-full text-xs font-semibold"
          >
            {initialsOf(user)}
          </button>
        </UserMenu>
      </div>
    </header>
  )
}
