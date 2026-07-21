import 'server-only'
import { forbidden, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ROUTES } from '@/constants/routes'
import type { UserRole } from '@/db/schema'

export type SessionUser = {
  id: string
  role: UserRole
  name?: string | null
  email?: string | null
  image?: string | null
}

/**
 * Hierarquia de papéis: um papel cobre todos os de nível igual ou menor.
 * Manter isso explícito evita o erro clássico de comparar papéis por string
 * e deixar `admin` de fora de uma checagem escrita para `user`.
 */
const ROLE_LEVEL: Record<UserRole, number> = {
  user: 1,
  admin: 2,
}

/** `true` se o papel do usuário satisfaz o papel mínimo exigido. */
export function hasRole(user: SessionUser, minimum: UserRole): boolean {
  return ROLE_LEVEL[user.role] >= ROLE_LEVEL[minimum]
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

/**
 * Garante autenticação E papel mínimo (SEC-12).
 *
 * Distingue os dois casos de propósito: sem sessão vai para o login (a pessoa
 * pode resolver logando); com sessão e papel insuficiente responde 403 via
 * `forbidden()`, porque mandar para o login sugeriria que outra conta
 * resolveria e não diz a verdade sobre o que aconteceu.
 */
export async function requireRole(minimum: UserRole): Promise<SessionUser> {
  const user = await requireUser()
  if (!hasRole(user, minimum)) forbidden()
  return user
}

/** Atalho para o papel administrativo. */
export function requireAdmin(): Promise<SessionUser> {
  return requireRole('admin')
}
