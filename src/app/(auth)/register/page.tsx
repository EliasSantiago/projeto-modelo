import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/features/auth/register-form'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { getCurrentUser } from '@/lib/session'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = { title: 'Criar conta' }

async function RedirectIfAuthed() {
  if (await getCurrentUser()) redirect(ROUTES.dashboard)
  return null
}

export default function RegisterPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfAuthed />
      </Suspense>

      <h1 className="text-ink text-center text-[26px] leading-tight font-semibold tracking-[-0.025em] text-balance">
        Criar conta
      </h1>
      <p className="text-ink-3 mt-2 mb-7 text-center text-sm leading-relaxed text-balance">
        Preencha os dados para começar.
      </p>

      <OAuthButtons />
      <RegisterForm />
    </>
  )
}
