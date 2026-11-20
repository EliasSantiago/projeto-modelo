import 'server-only'
import { CredentialsSignin } from 'next-auth'
import { loginSchema } from '@/schemas/auth.schema'
import { authService } from '@/services/auth.service'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * Regras do login que precisam valer em TODAS as portas do Auth.js, não só na
 * Server Action. Ficam fora de `lib/auth.ts` para serem testáveis sem subir o
 * NextAuth.
 */

/**
 * Tentativa recusada pelo limite de login. Estende `CredentialsSignin` para o
 * Auth.js tratá-la como erro de credencial (sem vazar detalhe), com `code`
 * próprio para a UI mostrar a mensagem de espera em vez de "senha inválida".
 */
export class LoginRateLimitedError extends CredentialsSignin {
  override code = 'rate_limited'

  constructor(readonly retryAfter: number) {
    super()
  }
}

/**
 * `authorize` do provider Credentials.
 *
 * O limite (SEC-08) mora aqui, e não em `loginAction`: o Auth.js também expõe
 * esta função em `POST /api/auth/callback/credentials`, que o proxy não cobre.
 * Com o limite só na action, um script obtinha o token CSRF em
 * `/api/auth/csrf` e testava senhas sem cota nenhuma.
 */
export async function authorizeCredentials(credentials: unknown) {
  const parsed = loginSchema.safeParse(credentials)
  if (!parsed.success) return null

  // Chave por IP + e-mail: um atacante num só IP não trava o login alheio.
  const limit = await checkRateLimit('login', parsed.data.email)
  if (!limit.success) throw new LoginRateLimitedError(limit.retryAfter)

  return authService.verifyCredentials(parsed.data.email, parsed.data.password)
}

const normalizeEmail = (value: unknown) =>
  typeof value === 'string' && value.trim() !== ''
    ? value.trim().toLowerCase()
    : null

/**
 * O vínculo de uma conta OAuth prova a posse do e-mail do usuário?
 *
 * Só quando o provedor devolveu ESSE endereço. O evento `linkAccount` também
 * dispara quando alguém já logado vincula um provedor novo: aí `user` é a conta
 * da sessão, cujo e-mail pode ser de outra pessoa (cadastro não exige posse),
 * e o perfil OAuth traz um endereço diferente. Marcar como verificado nesse
 * caso transferia a "prova" de um e-mail para outro.
 */
export function oauthProvesEmail(
  userEmail: string | null | undefined,
  profileEmail: unknown,
): boolean {
  const user = normalizeEmail(userEmail)
  return user !== null && user === normalizeEmail(profileEmail)
}
