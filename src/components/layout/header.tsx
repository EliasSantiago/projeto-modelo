import Link from 'next/link'
import { signOutAction } from '@/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Wordmark } from '@/components/layout/logo'
import { getCurrentUser } from '@/lib/session'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'

/** Shell estático do header (fallback de Suspense enquanto a sessão carrega). */
export function HeaderSkeleton() {
  return (
    <header className="border-line bg-bg/85 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Wordmark />
        <div className="bg-surface-3 h-9 w-32 animate-pulse rounded-full" />
      </div>
    </header>
  )
}

/** Header do app: marca, navegação e estado de sessão (Server Component). */
export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="border-line bg-bg/85 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.home} aria-label={`${APP.name}, ir para o início`}>
          <Wordmark />
        </Link>

        <nav className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href={ROUTES.docs}>Docs</Link>
          </Button>
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.dashboard}>Dashboard</Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.login}>Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={ROUTES.register}>Criar conta</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
