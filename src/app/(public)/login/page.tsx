import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { signInWithEmail, signInWithProvider } from '@/actions/auth.actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { enabledProviders } from '@/lib/auth'
import { getCurrentUser } from '@/lib/session'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = { title: 'Entrar' }

/** Lê a sessão (cookies) sob Suspense; redireciona quem já está logado. */
async function RedirectIfAuthed() {
  if (await getCurrentUser()) redirect(ROUTES.dashboard)
  return null
}

export default function LoginPage() {
  // `enabledProviders` deriva de env (não de request data) — estático.
  const noneConfigured =
    !enabledProviders.google &&
    !enabledProviders.github &&
    !enabledProviders.email

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-24">
      <Suspense fallback={null}>
        <RedirectIfAuthed />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Acesse com um provedor ou receba um link por e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {enabledProviders.google && (
            <form action={signInWithProvider.bind(null, 'google')}>
              <Button type="submit" variant="outline" className="w-full">
                Continuar com Google
              </Button>
            </form>
          )}

          {enabledProviders.github && (
            <form action={signInWithProvider.bind(null, 'github')}>
              <Button type="submit" variant="outline" className="w-full">
                Continuar com GitHub
              </Button>
            </form>
          )}

          {enabledProviders.email && (
            <form action={signInWithEmail} className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="voce@exemplo.com"
              />
              <Button type="submit" className="w-full">
                Enviar link de acesso
              </Button>
            </form>
          )}

          {noneConfigured && (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Nenhum provedor configurado. Preencha as variáveis de autenticação
              no <code>.env.local</code> (veja o README).
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
