'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Error boundary raiz das rotas. Captura o que os boundaries mais específicos
 * (ex.: `(dashboard)/dashboard/error.tsx`) deixarem passar.
 *
 * `error.message` NUNCA é exibido: em produção o Next já o substitui por uma
 * mensagem genérica, mas em dev ele carrega detalhe interno, e uma tela que
 * muda de conteúdo entre ambientes esconde exatamente o que precisaria ser
 * testado. O `digest` é o que correlaciona esta tela com o log do servidor
 * gravado por `instrumentation.ts` (SEC-07, SEC-24).
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">Algo deu errado</h1>
      <p className="text-[var(--color-muted-foreground)]">
        Tivemos um problema ao carregar esta página. Tente novamente.
      </p>
      {error.digest && (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Código do erro: <code>{error.digest}</code>
        </p>
      )}
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  )
}
