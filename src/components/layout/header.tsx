import Link from 'next/link'
import { signOutAction } from '@/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { getCurrentUser } from '@/lib/session'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'

/** Shell estático do header (fallback de Suspense enquanto a sessão carrega). */
export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <span className="font-semibold">{APP.name}</span>
        <div className="h-9 w-32 animate-pulse rounded-md bg-[var(--color-muted)]" />
      </div>
    </header>
  )
}

/** Header do app: marca, navegação e estado de sessão (Server Component). */
export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.home} className="font-semibold">
          {APP.name}
        </Link>

        <nav className="flex items-center gap-2">
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
            <Button asChild size="sm">
              <Link href={ROUTES.login}>Entrar</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
