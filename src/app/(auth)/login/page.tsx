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
    <p className="bg-success-soft text-success mb-6 rounded-[var(--radius-sm)] p-3 text-sm">
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

      <h1 className="text-ink text-center text-[26px] leading-tight font-semibold tracking-[-0.025em] text-balance">
        Entrar
      </h1>
      <p className="text-ink-3 mt-2 mb-7 text-center text-sm leading-relaxed text-balance">
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
