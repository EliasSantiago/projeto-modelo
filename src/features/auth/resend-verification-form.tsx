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
          className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400"
          role="status"
        >
          {state.message}
        </p>
      )}

      {state?.error && (
        <p
          className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400"
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

      <p className="text-navy-200 mt-6 text-center text-sm">
        <Link
          href={ROUTES.login}
          className="text-brand-500 hover:text-brand-700 dark:text-navy-100 font-medium dark:hover:text-white"
        >
          Voltar ao login
        </Link>
      </p>
    </form>
  )
}
