import type { DefaultSession } from 'next-auth'

/**
 * Augmentation da sessão do Auth.js para expor `user.id` de forma tipada.
 * `session.user.id` é usado para autorização (posse de recursos, SEC-04).
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
