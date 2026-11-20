'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import {
  resendVerificationAction,
  type AuthFormState,
} from '@/actions/auth.actions'
import { AuthInput } from '@/components/ui/auth-input'
import { SubmitButton } from '@/components/ui/submit-button'
import { ROUTES } from '@/constants/routes'

/** Ilha de cliente: pedir novo link de confirmação de e-mail. */
export function ResendVerificationForm({
  defaultEmail,
}: {
  defaultEmail?: string
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    resendVerificationAction,
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

      {state?.error && (
        <p
          className="bg-danger-soft text-danger mb-4 rounded-[var(--radius-sm)] p-3 text-sm"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <AuthInput
        label="E-mail*"
        name="email"
        type="email"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        defaultValue={defaultEmail}
        error={state?.fieldErrors?.email?.[0]}
      />

      <SubmitButton className="w-full" size="lg" pendingLabel="Enviando...">
        Enviar novo link
      </SubmitButton>

      <p className="text-ink-3 mt-6 text-center text-sm">
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
