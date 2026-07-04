import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form'

export const metadata: Metadata = { title: 'Recuperar conta' }

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-navy-700 text-4xl font-bold dark:text-white">
        Recuperar conta
      </h1>
      <p className="text-navy-200 mt-2 mb-8">
        Informe seu e-mail e enviaremos um link para redefinir a senha.
      </p>

      <ForgotPasswordForm />
    </>
  )
}
