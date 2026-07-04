/** Rotas centralizadas — fonte única para navegação e gate de proteção. */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
} as const

/** Prefixos de rota que exigem autenticação (usados pelo proxy.ts). */
export const PROTECTED_PREFIXES = ['/dashboard'] as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
