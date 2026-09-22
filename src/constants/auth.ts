/**
 * Nomes dos cookies de sessão do Auth.js.
 *
 * Vivem aqui, e não em `lib/auth.ts`, porque o `proxy.ts` precisa deles para
 * o gate barato de rota e não deve importar o módulo de auth (que puxa o
 * cliente do banco e o env do servidor para dentro do bundle do proxy).
 *
 * Em produção o Auth.js usa o prefixo `__Secure-`, que o navegador só aceita
 * sob HTTPS e com a flag `Secure`. Os dois nomes convivem porque o mesmo
 * código roda em dev (http) e em produção (https).
 */
export const SESSION_COOKIE = 'authjs.session-token'
export const SECURE_SESSION_COOKIE = '__Secure-authjs.session-token'

/** Todos os nomes possíveis, para quem só precisa detectar presença. */
export const SESSION_COOKIE_NAMES = [
  SESSION_COOKIE,
  SECURE_SESSION_COOKIE,
] as const

/** Nome efetivo do cookie no ambiente informado. */
export function sessionCookieName(isProduction: boolean): string {
  return isProduction ? SECURE_SESSION_COOKIE : SESSION_COOKIE
}
