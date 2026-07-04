'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log no cliente; detalhe sensível fica no servidor (SEC-07).
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-10">
      <h2 className="text-xl font-semibold">Algo deu errado</h2>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        Não foi possível carregar o dashboard. Tente novamente.
      </p>
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  )
}
