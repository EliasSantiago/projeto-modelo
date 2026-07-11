import { Suspense } from 'react'
import { Header, HeaderSkeleton } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header lê a sessão (cookies), dinâmico, sob Suspense para PPR. */}
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
