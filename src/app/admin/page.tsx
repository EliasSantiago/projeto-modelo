import { Suspense } from 'react'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Administração',
  robots: { index: false, follow: false },
}

/**
 * Área restrita a administradores. Referência de rota protegida por papel:
 *
 *  1. `/admin` está em `PROTECTED_PREFIXES`, então o proxy corta o visitante
 *     anônimo antes de renderizar qualquer coisa (gate barato);
 *  2. `requireAdmin()` é o enforcement real, feito no servidor a cada acesso.
 *     Sessão sem papel suficiente cai em `forbidden()` → 403.
 *
 * O passo 2 sozinho já bastaria para a segurança; o passo 1 evita trabalho
 * inútil. O contrário não vale: o proxy sozinho NÃO protege nada, porque ele
 * apenas confere a presença do cookie, sem validar o conteúdo.
 */
async function AdminContent() {
  const user = await requireAdmin()

  return (
    <>
      <h1 className="text-3xl font-bold">Administração</h1>
      <p className="text-[var(--color-muted-foreground)]">
        Área restrita ao papel <code>admin</code>. Você está autenticado como{' '}
        <strong>{user.email}</strong>.
      </p>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        Use esta página como modelo: proteja Server Actions administrativas com{' '}
        <code>adminAction</code> (<code>lib/safe-action.ts</code>) e páginas com{' '}
        <code>requireRole</code> (<code>lib/session.ts</code>).
      </p>
    </>
  )
}

export default function AdminPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-6">
      {/* A sessão é dado de request e não é cacheável: precisa ficar sob
          Suspense para não bloquear o prerender da rota (Cache Components). */}
      <Suspense
        fallback={
          <div className="h-32 animate-pulse rounded-lg bg-[var(--color-muted)]/20" />
        }
      >
        <AdminContent />
      </Suspense>
    </div>
  )
}
