import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/features/auth/reset-password-form'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = { title: 'Redefinir senha' }

async function ResetContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <>
        <h1 className="text-ink text-center text-[26px] leading-tight font-semibold tracking-[-0.025em] text-balance">
          Link inválido
        </h1>
        <p className="text-ink-3 mt-2 mb-7 text-center text-sm leading-relaxed text-balance">
          O link de recuperação é inválido ou está incompleto.
        </p>
        <Link
          href={ROUTES.forgotPassword}
          className="text-ink block text-center text-sm font-medium underline-offset-4 hover:underline"
        >
          Solicitar um novo link
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="text-ink text-center text-[26px] leading-tight font-semibold tracking-[-0.025em] text-balance">
        Redefinir senha
      </h1>
      <p className="text-ink-3 mt-2 mb-7 text-center text-sm leading-relaxed text-balance">
        Escolha uma nova senha.
      </p>

      <ResetPasswordForm token={token} />
    </>
  )
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  return (
    <Suspense fallback={null}>
      <ResetContent searchParams={searchParams} />
    </Suspense>
  )
}
