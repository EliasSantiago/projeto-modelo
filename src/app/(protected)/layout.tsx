import { Suspense } from 'react'
import { Header, HeaderSkeleton } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { requireUser } from '@/lib/session'

/**
 * Gate de autenticação REAL no servidor (defesa em profundidade além do
 * proxy) — RF-02. Isolado num componente async sob Suspense para satisfazer
 * o prerender parcial (Cache Components): a leitura de cookies fica dentro
 * de um boundary, permitindo o streaming do shell estático.
 */
async function AuthGate({ children }: { children: React.ReactNode }) {
  await requireUser()
  return <>{children}</>
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <main className="flex-1">
        <Suspense fallback={null}>
          <AuthGate>{children}</AuthGate>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
