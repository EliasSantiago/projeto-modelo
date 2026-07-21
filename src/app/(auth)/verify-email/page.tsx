import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  authService,
  InvalidVerificationTokenError,
} from '@/services/auth.service'
import { verifyEmailSchema } from '@/schemas/auth.schema'
import { getCurrentUser } from '@/lib/session'
import { logger } from '@/lib/logger'
import { ResendVerificationForm } from '@/features/auth/resend-verification-form'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'Confirmar e-mail',
  robots: { index: false, follow: false },
}

function Success() {
  return (
    <>
      <h1 className="text-navy-700 text-4xl font-bold dark:text-white">
        E-mail confirmado
      </h1>
      <p className="text-navy-200 mt-2 mb-8">
        Seu endereço foi confirmado com sucesso. Entre novamente para que a
        mudança apareça na sua sessão.
      </p>
      <Link
        href={ROUTES.login}
        className="text-brand-500 hover:text-brand-700 dark:text-navy-100 font-medium dark:hover:text-white"
      >
        Ir para o login
      </Link>
    </>
  )
}

async function VerifyContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const parsed = verifyEmailSchema.safeParse(params)

  // Sem token na URL: a pessoa chegou aqui para pedir um link, não para usar
  // um. Pré-preenche o e-mail se já houver sessão.
  if (!parsed.success) {
    const user = await getCurrentUser()

    if (user?.emailVerified) {
      return (
        <>
          <h1 className="text-navy-700 text-4xl font-bold dark:text-white">
            Tudo certo
          </h1>
          <p className="text-navy-200 mt-2 mb-8">
            Seu e-mail já está confirmado.
          </p>
          <Link
            href={ROUTES.dashboard}
            className="text-brand-500 hover:text-brand-700 dark:text-navy-100 font-medium dark:hover:text-white"
          >
            Ir para o painel
          </Link>
        </>
      )
    }

    return (
      <>
        <h1 className="text-navy-700 text-4xl font-bold dark:text-white">
          Confirme seu e-mail
        </h1>
        <p className="text-navy-200 mt-2 mb-8">
          Enviamos um link de confirmação para o seu endereço. Não recebeu?
          Pedimos outro.
        </p>
        <ResendVerificationForm defaultEmail={user?.email ?? undefined} />
      </>
    )
  }

  // O try/catch envolve só o efeito, nunca o JSX: montar elemento dentro do
  // catch faria erro de render ser capturado aqui em vez de subir para o
  // error boundary.
  let verified = false
  try {
    await authService.verifyEmail(parsed.data.token)
    verified = true
  } catch (error) {
    // Só token recusado vira "link inválido". Qualquer outra falha (banco
    // fora, por exemplo) sobe para o error boundary: mostrar "link inválido"
    // numa indisponibilidade mandaria a pessoa pedir links que também vão
    // falhar, e esconderia o incidente de quem opera.
    if (!(error instanceof InvalidVerificationTokenError)) throw error

    // Token inexistente e token expirado levam à mesma tela de propósito:
    // distinguir os casos diria a quem testa links se acertou um token real.
    logger.info('Confirmação de e-mail recusada', {
      reason: error.name,
    })
  }

  if (verified) return <Success />

  return (
    <>
      <h1 className="text-navy-700 text-4xl font-bold dark:text-white">
        Link inválido ou expirado
      </h1>
      <p className="text-navy-200 mt-2 mb-8">
        Este link não vale mais. Ele expira em 24 horas e só pode ser usado uma
        vez. Peça um novo abaixo.
      </p>
      <ResendVerificationForm />
    </>
  )
}

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  // `searchParams` e a sessão são dado de request: precisam ficar sob
  // Suspense para não bloquear o prerender (Cache Components).
  return (
    <Suspense fallback={null}>
      <VerifyContent searchParams={searchParams} />
    </Suspense>
  )
}
