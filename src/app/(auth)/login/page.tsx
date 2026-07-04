import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/features/auth/login-form'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { getCurrentUser } from '@/lib/session'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = { title: 'Entrar' }

async function RedirectIfAuthed() {
  if (await getCurrentUser()) redirect(ROUTES.dashboard)
  return null
}

async function ResetNotice({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  const { reset } = await searchParams
  if (reset !== 'success') return null
  return (
    <p className="mb-6 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
      Senha redefinida com sucesso. Faça login com a nova senha.
    </p>
  )
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfAuthed />
      </Suspense>

      <h1 className="text-navy-700 text-4xl font-bold dark:text-white">
        Entrar
      </h1>
      <p className="text-navy-200 mt-2 mb-8">
        Informe seu e-mail e senha para acessar.
      </p>

      <Suspense fallback={null}>
        <ResetNotice searchParams={searchParams} />
      </Suspense>

      <OAuthButtons />
      <LoginForm />
    </>
  )
}
