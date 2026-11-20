'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/sidebar'
import { Navbar } from '@/components/admin/navbar'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/lib/session'

/**
 * Admin shell: sidebar fixa (lg) recolhível + drawer no mobile + navbar +
 * conteúdo. O estado de recolhido vive aqui para o conteúdo acompanhar a
 * largura da sidebar (margem responsiva).
 */
export function AdminShell({
  user,
  children,
}: {
  user: SessionUser | null
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="bg-bg min-h-dvh">
      {/* Sidebar fixa em telas grandes (largura anima ao recolher) */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 ease-out motion-reduce:transition-none lg:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <Sidebar
          user={user}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
        />
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="shadow-pop absolute inset-y-0 left-0 w-72">
            <Sidebar user={user} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Conteúdo (margem acompanha a largura da sidebar) */}
      <div
        className={cn(
          'flex min-h-dvh flex-col transition-[padding] duration-200 ease-out motion-reduce:transition-none',
          collapsed ? 'lg:pl-16' : 'lg:pl-64',
        )}
      >
        <Navbar user={user} onMenuClick={() => setOpen(true)} />
        <main id="conteudo" className="flex-1 px-4 pt-2 pb-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
