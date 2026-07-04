'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { resetPasswordAction, type AuthFormState } from '@/actions/auth.actions'
import { AuthInput } from '@/components/ui/auth-input'
import { SubmitButton } from '@/components/ui/submit-button'
import { ROUTES } from '@/constants/routes'

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    resetPasswordAction,
    null,
  )

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="token" value={token} />

      {state?.error && (
        <p
          className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <AuthInput
        label="Nova senha*"
        name="password"
        type="password"
        placeholder="Mín. 8 caracteres"
        autoComplete="new-password"
        error={state?.fieldErrors?.password?.[0]}
      />

      <AuthInput
        label="Confirmar nova senha*"
        name="confirmPassword"
        type="password"
        placeholder="Repita a senha"
        autoComplete="new-password"
        error={state?.fieldErrors?.confirmPassword?.[0]}
      />

      <SubmitButton className="w-full" size="lg" pendingLabel="Salvando...">
        Redefinir senha
      </SubmitButton>

      <p className="text-navy-200 mt-6 text-center text-sm">
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
