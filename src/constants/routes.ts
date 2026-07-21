/** Rotas centralizadas, fonte única para navegação e gate de proteção. */
export const ROUTES = {
  home: '/',
  docs: '/docs',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  tables: '/dashboard/tables',
  marketplace: '/dashboard/marketplace',
  profile: '/dashboard/profile',
  settings: '/settings',
  admin: '/admin',
} as const

/**
 * Prefixos de rota que exigem autenticação (usados pelo proxy.ts).
 *
 * As páginas de exemplo (`/dashboard/*`) são PÚBLICAS de propósito: servem de
 * documentação viva do layout. `/admin` é a área realmente protegida, e
 * demonstra as duas camadas: o proxy corta o anônimo cedo e `requireAdmin`
 * faz o enforcement de verdade na página.
 *
 * Para proteger uma rota nova, adicione o prefixo aqui E chame
 * `requireUser`/`requireRole` na página, nunca só uma das duas.
 */
export const PROTECTED_PREFIXES = ['/admin'] as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
