/** Rotas centralizadas — fonte única para navegação e gate de proteção. */
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
} as const

/**
 * Prefixos de rota que exigem autenticação (usados pelo proxy.ts).
 * As páginas de exemplo (`/dashboard/*`) são públicas para servir de
 * documentação. Para proteger uma rota real, adicione o prefixo aqui, ex.:
 *   export const PROTECTED_PREFIXES = ['/app'] as const
 */
export const PROTECTED_PREFIXES = [] as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
