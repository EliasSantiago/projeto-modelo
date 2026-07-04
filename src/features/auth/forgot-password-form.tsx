'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import {
  requestPasswordResetAction,
  type AuthFormState,
} from '@/actions/auth.actions'
import { AuthInput } from '@/components/ui/auth-input'
import { SubmitButton } from '@/components/ui/submit-button'
import { ROUTES } from '@/constants/routes'

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    requestPasswordResetAction,
    null,
  )

  return (
    <form action={formAction} noValidate>
      {state?.message && (
        <p
          className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400"
          role="status"
        >
          {state.message}
        </p>
      )}

      <AuthInput
        label="E-mail*"
        name="email"
        type="email"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        error={state?.fieldErrors?.email?.[0]}
      />

      <SubmitButton className="w-full" size="lg" pendingLabel="Enviando...">
        Enviar link de recuperação
      </SubmitButton>

      <p className="text-navy-200 mt-6 text-center text-sm">
        Lembrou a senha?{' '}
        <Link
          href={ROUTES.login}
          className="text-brand-500 hover:text-brand-600 font-medium"
        >
          Voltar ao login
        </Link>
      </p>
    </form>
  )
}
