'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { registerAction, type AuthFormState } from '@/actions/auth.actions'
import { AuthInput } from '@/components/ui/auth-input'
import { SubmitButton } from '@/components/ui/submit-button'
import { ROUTES } from '@/constants/routes'

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    registerAction,
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
        label="Nome*"
        name="name"
        placeholder="Seu nome"
        autoComplete="name"
        error={state?.fieldErrors?.name?.[0]}
      />

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
        autoComplete="new-password"
        error={state?.fieldErrors?.password?.[0]}
      />

      <AuthInput
        label="Confirmar senha*"
        name="confirmPassword"
        type="password"
        placeholder="Repita a senha"
        autoComplete="new-password"
        error={state?.fieldErrors?.confirmPassword?.[0]}
      />

      <SubmitButton
        className="mt-2 w-full"
        size="lg"
        pendingLabel="Criando conta..."
      >
        Criar conta
      </SubmitButton>

      <p className="text-navy-200 mt-6 text-center text-sm">
        Já tem conta?{' '}
        <Link
          href={ROUTES.login}
          className="text-brand-500 hover:text-brand-600 font-medium"
        >
          Entrar
        </Link>
      </p>
    </form>
  )
}
