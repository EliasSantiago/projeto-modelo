import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ROUTES } from '@/constants/routes'

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

/** Retorna o usuário autenticado ou `null`. Uso em Server Components. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth()
  return session?.user ?? null
}

/**
 * Garante um usuário autenticado; caso contrário redireciona para login.
 * Enforcement real de autorização (defesa em profundidade), SEC-04.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.login)
  return user
}
