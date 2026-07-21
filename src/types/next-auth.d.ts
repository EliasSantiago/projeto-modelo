import type { DefaultSession } from 'next-auth'
import type { UserRole } from '@/db/schema'

/**
 * Augmentation da sessão do Auth.js para expor `user.id` e `user.role` de
 * forma tipada. Ambos são usados para autorização (SEC-04, SEC-12).
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: UserRole
  }
}
