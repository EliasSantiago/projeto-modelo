import { Suspense } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { getCurrentUser } from '@/lib/session'

/**
 * Layout das páginas de exemplo (admin shell). Estas telas são PÚBLICAS para
 * servir de documentação, não exigem login. A sessão é opcional: com usuário,
 * a navbar mostra o menu da conta; sem usuário, um acesso de visitante.
 * Para proteger rotas reais, use `requireUser` e adicione o prefixo em
 * `PROTECTED_PREFIXES` (proxy.ts).
 */
async function Shell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return <AdminShell user={user}>{children}</AdminShell>
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={<div className="bg-light-primary dark:bg-navy-900 min-h-dvh" />}
    >
      <Shell>{children}</Shell>
    </Suspense>
  )
}
