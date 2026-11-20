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
          className="bg-success-soft text-success mb-4 rounded-[var(--radius-sm)] p-3 text-sm"
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

      <p className="text-ink-3 mt-6 text-center text-sm">
        Lembrou a senha?{' '}
        <Link
          href={ROUTES.login}
          className="text-ink font-medium underline-offset-4 hover:underline"
        >
          Voltar ao login
        </Link>
      </p>
    </form>
  )
}
