import NextAuth, { type NextAuthConfig } from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Nodemailer from 'next-auth/providers/nodemailer'
import { db } from '@/db/client'
import { accounts, sessions, users, verificationTokens } from '@/db/schema'
import { serverEnv } from '@/lib/env.server'
import { ROUTES } from '@/constants/routes'

/**
 * Configuração central do Auth.js v5.
 * Provedores são adicionados condicionalmente conforme as credenciais
 * presentes no ambiente — o starter sobe mesmo sem OAuth configurado.
 */
const providers: NextAuthConfig['providers'] = []

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

if (serverEnv.AUTH_EMAIL_SERVER && serverEnv.AUTH_EMAIL_FROM) {
  providers.push(
    Nodemailer({
      server: serverEnv.AUTH_EMAIL_SERVER,
      from: serverEnv.AUTH_EMAIL_FROM,
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
  session: { strategy: 'database' },
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
    // Expõe o id do usuário na sessão para autorização (SEC-04).
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

/** Ids dos provedores efetivamente configurados (para renderizar o login). */
export const enabledProviders = {
  google: Boolean(serverEnv.AUTH_GOOGLE_ID && serverEnv.AUTH_GOOGLE_SECRET),
  github: Boolean(serverEnv.AUTH_GITHUB_ID && serverEnv.AUTH_GITHUB_SECRET),
  email: Boolean(serverEnv.AUTH_EMAIL_SERVER && serverEnv.AUTH_EMAIL_FROM),
} as const
