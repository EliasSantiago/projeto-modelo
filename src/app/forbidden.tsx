import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

/**
 * Resposta a `forbidden()` (HTTP 403), disparado por `requireRole` quando há
 * sessão válida mas o papel é insuficiente. Não descreve o recurso negado
 * nem o papel exigido: seria dizer ao visitante o que vale a pena atacar.
 */
export default function Forbidden() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-[var(--color-muted-foreground)]">
        Você não tem permissão para acessar esta página.
      </p>
      <Button asChild>
        <Link href={ROUTES.dashboard}>Voltar ao painel</Link>
      </Button>
    </div>
  )
}
