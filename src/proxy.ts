import { NextResponse, type NextRequest } from 'next/server'
import { PROTECTED_PREFIXES, ROUTES } from '@/constants/routes'
import { SESSION_COOKIE_NAMES } from '@/constants/auth'

/**
 * Proxy (Next.js 16, substitui o middleware.ts).
 * Faz um gate barato de rotas privadas por presença do cookie de sessão,
 * redirecionando cedo. A autorização REAL acontece no layout protegido e em
 * cada Server Action (defesa em profundidade), este proxy não confia no
 * conteúdo do cookie, apenas evita render desnecessário para deslogados.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
  if (!isProtected) return NextResponse.next()

  const hasSession = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name),
  )
  if (hasSession) return NextResponse.next()

  const loginUrl = new URL(ROUTES.login, request.url)
  loginUrl.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(loginUrl)
}

export const proxyConfig = {
  /**
   * Só o que pode virar uma rota protegida. Ficam de fora os assets, a API do
   * Auth.js (que precisa responder a deslogado, é ela que faz o login) e os
   * arquivos de metadado gerados pelo Next. Rodar o proxy neles seria custo
   * por requisição sem nenhum gate para aplicar.
   */
  matcher: [
    '/((?!_next/static|_next/image|api/auth|favicon.ico|icon.svg|manifest.webmanifest|robots.txt|sitemap.xml|.well-known).*)',
  ],
}
