'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { signOutAction } from '@/actions/auth.actions'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ADMIN_NAV } from '@/constants/nav'
import { ROUTES } from '@/constants/routes'
import type { SessionUser } from '@/lib/session'

function initialsOf(user: SessionUser | null) {
  const base = user?.name ?? user?.email ?? 'V'
  return base.slice(0, 2).toUpperCase()
}

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

  return (
    <header className="dark:bg-navy-800/80 sticky top-4 z-30 mx-4 flex items-center justify-between gap-4 rounded-[20px] border border-[var(--color-border)] bg-white/80 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="text-navy-500 lg:hidden dark:text-white"
        >
          <Bars3Icon className="size-6" />
        </button>
        <div>
          <p className="text-navy-400 text-xs">
            Páginas / {current?.label ?? 'Dashboard'}
          </p>
          <h1 className="text-navy-700 text-2xl font-bold dark:text-white">
            {current?.label ?? 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Menu do usuário"
              className="from-brand-400 to-brand-600 flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white"
            >
              {initialsOf(user)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="truncate">
              {user ? `👋 ${user.name ?? user.email}` : 'Visitante'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.profile}>
                <UserIcon className="size-4" aria-hidden />
                Perfil
              </Link>
            </DropdownMenuItem>
            {user ? (
              <form action={signOutAction}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full text-red-500">
                    <ArrowRightStartOnRectangleIcon
                      className="size-4"
                      aria-hidden
                    />
                    Sair
                  </button>
                </DropdownMenuItem>
              </form>
            ) : (
              <DropdownMenuItem asChild>
                <Link href={ROUTES.login}>
                  <ArrowRightEndOnRectangleIcon
                    className="size-4"
                    aria-hidden
                  />
                  Entrar
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
