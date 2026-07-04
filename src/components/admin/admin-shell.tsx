'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/sidebar'
import { Navbar } from '@/components/admin/navbar'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/lib/session'

/** Admin shell: sidebar fixa (lg) + drawer no mobile + navbar + conteúdo. */
export function AdminShell({
  user,
  children,
}: {
  user: SessionUser | null
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-light-primary dark:bg-navy-900 min-h-dvh">
      {/* Sidebar fixa em telas grandes */}
      <div className="fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--color-border)] lg:block">
        <Sidebar />
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 shadow-xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div className={cn('flex min-h-dvh flex-col lg:ml-72')}>
        <Navbar user={user} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  )
}
