import { NextResponse, type NextRequest } from 'next/server'
import { PROTECTED_PREFIXES, ROUTES } from '@/constants/routes'

/**
 * Proxy (Next.js 16 — substitui o middleware.ts).
 * Faz um gate barato de rotas privadas por presença do cookie de sessão,
 * redirecionando cedo. A autorização REAL acontece no layout protegido e em
 * cada Server Action (defesa em profundidade) — este proxy não confia no
 * conteúdo do cookie, apenas evita render desnecessário para deslogados.
 */
const SESSION_COOKIES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
  if (!isProtected) return NextResponse.next()

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name))
  if (hasSession) return NextResponse.next()

  const loginUrl = new URL(ROUTES.login, request.url)
  loginUrl.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(loginUrl)
}

export const proxyConfig = {
  // Ignora assets estáticos e a própria API de auth.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
