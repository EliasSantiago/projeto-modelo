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
          className="bg-danger-soft text-danger mb-4 rounded-[var(--radius-sm)] p-3 text-sm"
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
