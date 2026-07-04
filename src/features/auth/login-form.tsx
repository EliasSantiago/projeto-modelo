'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { loginAction, type AuthFormState } from '@/actions/auth.actions'
import { AuthInput } from '@/components/ui/auth-input'
import { SubmitButton } from '@/components/ui/submit-button'
import { ROUTES } from '@/constants/routes'

export function LoginForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    loginAction,
    null,
  )

  return (
    <form action={formAction} noValidate>
      {state?.error && (
        <p
          className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10"
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
        error={state?.fieldErrors?.email?.[0]}
      />

      <AuthInput
        label="Senha*"
        name="password"
        type="password"
        placeholder="Mín. 8 caracteres"
        autoComplete="current-password"
        error={state?.fieldErrors?.password?.[0]}
      />

      <div className="mb-4 flex justify-end">
        <Link
          href={ROUTES.forgotPassword}
          className="text-brand-500 hover:text-brand-700 dark:text-navy-100 text-sm font-medium dark:hover:text-white"
        >
          Esqueceu a senha?
        </Link>
      </div>

      <SubmitButton className="w-full" size="lg" pendingLabel="Entrando...">
        Entrar
      </SubmitButton>

      <p className="text-navy-200 mt-6 text-center text-sm">
        Ainda não tem conta?{' '}
        <Link
          href={ROUTES.register}
          className="text-brand-500 hover:text-brand-700 dark:text-navy-100 font-medium dark:hover:text-white"
        >
          Criar conta
        </Link>
      </p>
    </form>
  )
}
