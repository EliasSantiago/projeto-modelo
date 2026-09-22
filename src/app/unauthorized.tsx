import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

/**
 * Resposta a `unauthorized()` (HTTP 401), o par de `forbidden()` habilitado
 * por `experimental.authInterrupts`.
 *
 * A distinção importa: 401 é "não sei quem você é" (logar resolve) e 403 é
 * "sei quem você é e não basta" (logar não resolve). `requireUser` prefere
 * `redirect` para o login, que é mais direto na UI; use `unauthorized()` onde
 * o status HTTP correto importa — Route Handlers e clientes de API.
 */
export default function Unauthorized() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">401</h1>
      <p className="text-[var(--color-muted-foreground)]">
        Você precisa entrar na sua conta para acessar esta página.
      </p>
      <Button asChild>
        <Link href={ROUTES.login}>Entrar</Link>
      </Button>
    </div>
  )
}
