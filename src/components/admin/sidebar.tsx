'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { UserMenu } from '@/components/admin/user-menu'
import { LogoMark, Wordmark } from '@/components/layout/logo'
import { PanelIcon } from '@/components/ui/panel-icon'
import { ADMIN_NAV } from '@/constants/nav'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/lib/session'

export function initialsOf(user: SessionUser | null) {
  const base = user?.name ?? user?.email ?? 'V'
  return base.slice(0, 2).toUpperCase()
}

/**
 * Sidebar do admin shell: trilho em degradê suave (`surface-rail`), itens em
 * pílula, item ativo preenchido. Dois modos: expandido (marca + rótulos +
 * usuário) e recolhido (só ícones). A largura é controlada pelo container.
 */
export function Sidebar({
  user,
  collapsed = false,
  onToggleCollapse,
  onExpand,
  onNavigate,
}: {
  user: SessionUser | null
  collapsed?: boolean
  onToggleCollapse?: () => void
  onExpand?: () => void
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const displayName = user?.name ?? user?.email ?? 'Visitante'
  const email = user?.email ?? 'Não autenticado'

  return (
    <aside className="surface-rail text-rail-ink border-rail-line flex h-full w-full flex-col overflow-x-hidden lg:border-r">
      {/* Marca + controles */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center',
          collapsed ? 'justify-center' : 'gap-2 px-5',
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={onExpand}
            title="Expandir menu"
            aria-label="Expandir menu"
            aria-expanded={false}
            className="group/toggle text-rail-ink-2 hover:text-rail-ink hover:bg-rail-hover flex size-10 items-center justify-center rounded-full transition-colors"
          >
            <LogoMark className="group-hover/toggle:hidden group-focus-visible/toggle:hidden" />
            <PanelIcon className="hidden size-5 group-hover/toggle:block group-focus-visible/toggle:block" />
          </button>
        ) : (
          <Link
            href={ROUTES.dashboard}
            onClick={onNavigate}
            className="min-w-0"
          >
            <Wordmark />
          </Link>
        )}

        {/* Recolher (desktop) */}
        {onToggleCollapse && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Recolher menu"
            aria-label="Recolher menu"
            aria-expanded
            className="text-rail-ink-2 hover:text-rail-ink hover:bg-rail-hover ml-auto flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <PanelIcon className="size-5" />
          </button>
        )}

        {/* Fechar (gaveta do celular) */}
        {onNavigate && !onToggleCollapse && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Fechar menu"
            className="text-rail-ink-2 hover:text-rail-ink hover:bg-rail-hover ml-auto flex size-8 items-center justify-center rounded-full lg:hidden"
          >
            <XMarkIcon className="size-5" />
          </button>
        )}
      </div>

      {/* Navegação */}
      <nav
        aria-label="Navegação principal"
        className="scroll-thin flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2"
      >
        {!collapsed && (
          <p className="text-rail-ink-2/80 mb-1.5 px-2.5 text-[11.5px] font-medium">
            Páginas
          </p>
        )}
        {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
          const active =
            href === ROUTES.dashboard
              ? pathname === href
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex h-10 items-center gap-2.5 rounded-full text-[13.5px] whitespace-nowrap transition-colors',
                collapsed ? 'mx-auto w-10 justify-center' : 'px-3',
                active
                  ? 'bg-rail-active text-rail-active-ink font-semibold'
                  : 'text-rail-ink-2 hover:bg-rail-hover hover:text-rail-ink hover:shadow-[var(--rail-hover-shadow)]',
              )}
            >
              <Icon
                className={cn(
                  'size-[18px] shrink-0',
                  active
                    ? 'text-rail-active-ink'
                    : 'text-rail-ink-2 group-hover:text-rail-ink transition-[color,transform] duration-150 group-hover:scale-110',
                )}
                aria-hidden
              />
              <span className={cn('truncate', collapsed && 'sr-only')}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Rodapé: usuário */}
      <div className="border-rail-line border-t px-3 py-3">
        <UserMenu
          user={user}
          side={collapsed ? 'right' : 'top'}
          align={collapsed ? 'end' : 'start'}
        >
          <button
            type="button"
            title={collapsed ? displayName : undefined}
            aria-label="Abrir menu do usuário"
            className={cn(
              'hover:bg-rail-hover data-[state=open]:bg-rail-hover flex w-full items-center gap-2.5 rounded-[var(--radius-md)] text-left transition-colors hover:shadow-[var(--rail-hover-shadow)]',
              collapsed ? 'justify-center p-1' : 'px-2 py-2',
            )}
          >
            <span className="bg-accent-soft text-accent-soft-ink flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {initialsOf(user)}
            </span>
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="text-rail-ink block truncate text-[13px] font-medium">
                    {displayName}
                  </span>
                  <span className="text-rail-ink-2 block truncate text-[11px]">
                    {email}
                  </span>
                </span>
                <ChevronUpDownIcon className="text-rail-ink-2 size-4 shrink-0" />
              </>
            )}
          </button>
        </UserMenu>
      </div>
    </aside>
  )
}
