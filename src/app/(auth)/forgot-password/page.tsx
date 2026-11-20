import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form'

export const metadata: Metadata = { title: 'Recuperar conta' }

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-ink text-center text-[26px] leading-tight font-semibold tracking-[-0.025em] text-balance">
        Recuperar conta
      </h1>
      <p className="text-ink-3 mt-2 mb-7 text-center text-sm leading-relaxed text-balance">
        Informe seu e-mail e enviaremos um link para redefinir a senha.
      </p>

      <ForgotPasswordForm />
    </>
  )
}
