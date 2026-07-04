import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-[var(--color-muted-foreground)]">
        Página não encontrada.
      </p>
      <Button asChild>
        <Link href={ROUTES.home}>Voltar ao início</Link>
      </Button>
    </div>
  )
}
