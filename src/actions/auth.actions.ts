'use server'

import { signIn, signOut } from '@/lib/auth'
import { ROUTES } from '@/constants/routes'

/** Inicia o fluxo OAuth de um provedor a partir de um <form>. */
export async function signInWithProvider(provider: string) {
  await signIn(provider, { redirectTo: ROUTES.dashboard })
}

/** Envia magic link por e-mail (provider Nodemailer). */
export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  await signIn('nodemailer', { email, redirectTo: ROUTES.dashboard })
}

/** Encerra a sessão e volta para a home. */
export async function signOutAction() {
  await signOut({ redirectTo: ROUTES.home })
}
