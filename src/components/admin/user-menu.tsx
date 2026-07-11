'use client'

import Link from 'next/link'
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { signOutAction } from '@/actions/auth.actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/constants/routes'
import type { SessionUser } from '@/lib/session'

/**
 * Menu do usuário disparado pelo avatar/linha de usuário. Reúne perfil,
 * configurações e o botão de sair (ou entrar) num único popover, no lugar de
 * botões soltos no rodapé da sidebar. Posição configurável (`side`/`align`)
 * para servir tanto ao rail recolhido quanto à sidebar expandida.
 */
export function UserMenu({
  user,
  side = 'top',
  align = 'start',
  children,
}: {
  user: SessionUser | null
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  children: React.ReactNode
}) {
  const displayName = user?.name ?? user?.email ?? 'Visitante'
  const email = user?.email ?? 'Não autenticado'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="min-w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-navy-700 truncate font-semibold dark:text-white">
            {displayName}
          </span>
          <span className="text-navy-400 truncate text-xs font-normal">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.profile}>
            <UserIcon className="size-4" aria-hidden />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.settings}>
            <Cog6ToothIcon className="size-4" aria-hidden />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
              <ArrowRightEndOnRectangleIcon className="size-4" aria-hidden />
              Entrar
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
