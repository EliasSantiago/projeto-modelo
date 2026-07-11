'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { UserMenu } from '@/components/admin/user-menu'
import { ADMIN_NAV } from '@/constants/nav'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/lib/session'

function initialsOf(user: SessionUser | null) {
  const base = user?.name ?? user?.email ?? 'V'
  return base.slice(0, 2).toUpperCase()
}

/**
 * Ícone de "painel lateral" (retângulo com um trilho à esquerda), o mesmo
 * usado nos toggles de sidebar do ChatGPT/Grok/Claude. Substitui a seta dupla
 * por um sinal mais direto de "abre/fecha o painel".
 */
function PanelLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <line x1="9.5" y1="4" x2="9.5" y2="20" />
    </svg>
  )
}

/**
 * Sidebar do admin shell. Dois modos: expandido (marca + labels + rodapé com
 * usuário) e recolhido (rail só de ícones em círculos perfeitos). A largura é
 * controlada pelo container; aqui alternamos o layout via `collapsed`.
 * Quando recolhida, clicar numa área vazia expande; os ícones e botões
 * executam sua própria ação (navegar/sair) sem expandir.
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
    <aside
      onClick={collapsed ? onExpand : undefined}
      className={cn(
        'dark:bg-navy-800 flex h-full w-full flex-col overflow-hidden bg-white',
        collapsed && 'cursor-pointer',
      )}
    >
      {/* Marca + controles */}
      <div
        className={cn(
          'flex items-center py-8',
          collapsed ? 'justify-center px-0' : 'justify-between px-8',
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onExpand?.()
            }}
            title="Expandir menu"
            aria-label="Expandir menu"
            className="group relative flex size-11 items-center justify-center rounded-full"
          >
            {/* Logo (some no hover) */}
            <span className="from-brand-400 to-brand-600 absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white transition-opacity duration-200 group-hover:opacity-0">
              {APP.name.slice(0, 1)}
            </span>
            {/* Toggle (aparece no hover) */}
            <span className="text-navy-400 group-hover:bg-light-primary dark:text-navy-300 dark:group-hover:bg-navy-700 group-hover:text-navy-700 absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:group-hover:text-white">
              <PanelLeftIcon className="size-5" />
            </span>
          </button>
        ) : (
          <span className="text-navy-700 truncate text-2xl font-bold dark:text-white">
            {APP.name}
          </span>
        )}

        {/* Recolher (desktop) */}
        {onToggleCollapse && !collapsed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleCollapse()
            }}
            title="Recolher menu"
            aria-label="Recolher menu"
            className="text-navy-400 hover:text-navy-700 hover:bg-light-primary dark:hover:bg-navy-700 -mr-1.5 rounded-lg p-1.5 transition-colors dark:hover:text-white"
          >
            <PanelLeftIcon className="size-5" />
          </button>
        )}

        {/* Fechar (mobile) */}
        {onNavigate && !collapsed && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Fechar menu"
            className="text-navy-400 lg:hidden"
          >
            <XMarkIcon className="size-6" />
          </button>
        )}
      </div>

      <div
        className={cn(
          'mx-auto mb-6 h-px bg-[var(--color-border)]',
          collapsed ? 'w-8' : 'w-4/5',
        )}
      />

      {/* Navegação */}
      <nav
        className={cn(
          'flex flex-1 flex-col gap-1',
          collapsed ? 'items-center px-2' : 'px-4',
        )}
      >
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
              onClick={
                collapsed ? (e) => e.stopPropagation() : () => onNavigate?.()
              }
              className={cn(
                'relative flex items-center transition-colors',
                collapsed
                  ? cn(
                      'size-11 justify-center rounded-full',
                      active
                        ? 'bg-brand-500 dark:bg-brand-400 text-white'
                        : 'text-navy-400 hover:bg-light-primary dark:hover:bg-navy-700',
                    )
                  : cn(
                      'gap-3 rounded-lg px-4 py-3 text-sm',
                      active
                        ? 'text-navy-700 font-bold dark:text-white'
                        : 'text-navy-400 hover:text-navy-700 font-medium dark:hover:text-white',
                    ),
              )}
            >
              <Icon
                className={cn(
                  'size-5 shrink-0',
                  !collapsed &&
                    (active
                      ? 'text-brand-500 dark:text-white'
                      : 'text-navy-400'),
                )}
                aria-hidden
              />
              {!collapsed && label}
              {!collapsed && active && (
                <span className="bg-brand-500 dark:bg-brand-400 absolute top-1/2 right-0 h-9 w-1 -translate-y-1/2 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé: usuário + sair */}
      <div className={cn('mt-auto pb-6', collapsed ? 'px-2' : 'px-4')}>
        <div
          className={cn(
            'mb-4 h-px bg-[var(--color-border)]',
            collapsed ? 'mx-auto w-8' : 'w-full',
          )}
        />

        {collapsed ? (
          <div className="flex justify-center">
            <UserMenu user={user} side="right" align="end">
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                title={displayName}
                aria-label="Abrir menu do usuário"
                className="from-brand-400 to-brand-600 flex size-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white"
              >
                {initialsOf(user)}
              </button>
            </UserMenu>
          </div>
        ) : (
          <UserMenu user={user} side="top" align="start">
            <button
              type="button"
              aria-label="Abrir menu do usuário"
              className="hover:bg-light-primary dark:hover:bg-navy-700 flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors"
            >
              <div className="from-brand-400 to-brand-600 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white">
                {initialsOf(user)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-navy-700 truncate text-sm font-semibold dark:text-white">
                  {displayName}
                </p>
                <p className="text-navy-400 truncate text-xs">{email}</p>
              </div>
              <ChevronUpDownIcon className="text-navy-400 size-5 shrink-0" />
            </button>
          </UserMenu>
        )}
      </div>
    </aside>
  )
}
