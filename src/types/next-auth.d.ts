import type { DefaultSession } from 'next-auth'
import type { UserRole } from '@/db/schema'

/**
 * Augmentation da sessão do Auth.js para expor `user.id`, `user.role` e
 * `user.emailVerified` de forma tipada (SEC-04, SEC-12, RF-13).
 *
 * No JWT `emailVerified` viaja como string ISO (JWT só carrega JSON); o
 * callback de sessão converte de volta para `Date`, que é o tipo que o
 * próprio next-auth já usa em `User`.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      emailVerified: Date | null
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
    emailVerified?: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: UserRole
    emailVerified?: string | null
  }
}
