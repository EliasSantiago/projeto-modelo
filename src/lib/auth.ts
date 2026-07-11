import NextAuth, { type NextAuthConfig } from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { db } from '@/db/client'
import { accounts, sessions, users, verificationTokens } from '@/db/schema'
import { authService } from '@/services/auth.service'
import { loginSchema } from '@/schemas/auth.schema'
import { serverEnv } from '@/lib/env.server'
import { ROUTES } from '@/constants/routes'

/**
 * Auth.js v5. Login por e-mail/senha (Credentials) + OAuth (Google/GitHub).
 * O provider Credentials exige estratégia de sessão JWT, os provedores OAuth
 * continuam usando o Drizzle adapter para criar/vincular contas.
 */
const providers: NextAuthConfig['providers'] = [
  Credentials({
    credentials: {
      email: { label: 'E-mail', type: 'email' },
      password: { label: 'Senha', type: 'password' },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials)
      if (!parsed.success) return null
      return authService.verifyCredentials(
        parsed.data.email,
        parsed.data.password,
      )
    },
  }),
]

if (serverEnv.AUTH_GOOGLE_ID && serverEnv.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: serverEnv.AUTH_GOOGLE_ID,
      clientSecret: serverEnv.AUTH_GOOGLE_SECRET,
    }),
  )
}

if (serverEnv.AUTH_GITHUB_ID && serverEnv.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: serverEnv.AUTH_GITHUB_ID,
      clientSecret: serverEnv.AUTH_GITHUB_SECRET,
    }),
  )
}

export const authConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers,
  session: { strategy: 'jwt' },
  pages: {
    signIn: ROUTES.login,
  },
  // Cookies de sessão seguros: HttpOnly + SameSite; Secure em produção (SEC-06).
  cookies: {
    sessionToken: {
      name:
        serverEnv.NODE_ENV === 'production'
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: serverEnv.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    // Persiste o id do usuário no token e o expõe na sessão (SEC-04).
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user && typeof token.id === 'string') {
        session.user.id = token.id
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

/** Provedores OAuth efetivamente configurados (para renderizar os botões). */
export const enabledProviders = {
  google: Boolean(serverEnv.AUTH_GOOGLE_ID && serverEnv.AUTH_GOOGLE_SECRET),
  github: Boolean(serverEnv.AUTH_GITHUB_ID && serverEnv.AUTH_GITHUB_SECRET),
} as const
