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
        <h1 className="text-navy-700 text-4xl font-bold dark:text-white">
          Link inválido
        </h1>
        <p className="text-navy-200 mt-2 mb-8">
          O link de recuperação é inválido ou está incompleto.
        </p>
        <Link
          href={ROUTES.forgotPassword}
          className="text-brand-500 hover:text-brand-700 dark:text-navy-100 font-medium dark:hover:text-white"
        >
          Solicitar um novo link
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="text-navy-700 text-4xl font-bold dark:text-white">
        Redefinir senha
      </h1>
      <p className="text-navy-200 mt-2 mb-8">Escolha uma nova senha.</p>

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
