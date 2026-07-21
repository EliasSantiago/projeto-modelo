import 'server-only'
import { randomBytes, createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { userRepository } from '@/repositories/user.repository'
import { passwordResetRepository } from '@/repositories/password-reset.repository'
import { emailVerificationRepository } from '@/repositories/email-verification.repository'
import { assertMailerConfigured, sendMail } from '@/lib/mailer'
import { logger } from '@/lib/logger'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'
import type { User, UserRole } from '@/db/schema'

export class EmailInUseError extends Error {
  constructor() {
    super('E-mail já cadastrado')
    this.name = 'EmailInUseError'
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super('Token inválido ou expirado')
    this.name = 'InvalidResetTokenError'
  }
}

export class InvalidVerificationTokenError extends Error {
  constructor() {
    super('Link de confirmação inválido ou expirado')
    this.name = 'InvalidVerificationTokenError'
  }
}

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30 // 30 minutos
// 24h: a pessoa costuma abrir o e-mail só no dia seguinte, e o token é de uso
// único e guardado como hash, então a janela maior custa pouco.
const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

export const authService = {
  /** Cria uma conta com senha (hash bcrypt). */
  async register(input: {
    name: string
    email: string
    password: string
  }): Promise<User> {
    const existing = await userRepository.findByEmail(input.email)
    if (existing) throw new EmailInUseError()

    const passwordHash = await bcrypt.hash(input.password, 12)
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    })

    // Envio best-effort: provedor de e-mail fora do ar não pode custar a
    // conta recém-criada. A pessoa pede outro link depois (SEC-19).
    try {
      await this.sendVerificationEmail(user)
    } catch (error) {
      logger.error('Falha ao enviar e-mail de confirmação no cadastro', error, {
        userId: user.id,
      })
    }

    return user
  },

  /**
   * Emite um convite de confirmação e envia o link.
   *
   * O token cru só existe no e-mail: o banco guarda o hash (SEC-14). Emitir
   * um novo invalida o anterior, então o link mais recente é sempre o único
   * válido.
   */
  async sendVerificationEmail(user: Pick<User, 'id' | 'email'>): Promise<void> {
    const token = randomBytes(32).toString('hex')

    await emailVerificationRepository.deleteForUser(user.id)
    await emailVerificationRepository.create(
      user.id,
      hashToken(token),
      new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    )

    const link = `${APP.url}${ROUTES.verifyEmail}?token=${token}`
    await sendMail({
      to: user.email,
      subject: `${APP.name}, confirme seu e-mail`,
      text:
        `Confirme seu endereço de e-mail acessando: ${link}\n` +
        `O link expira em 24 horas e só pode ser usado uma vez.\n\n` +
        `Se não foi você que criou esta conta, ignore esta mensagem.`,
    })
  },

  /**
   * Confirma o endereço a partir do token do link.
   *
   * A conta alvo vem do token no banco, nunca da requisição: é isso que
   * impede um convite de verificar outra conta (SEC-18). O token é apagado
   * em seguida, tornando o link de uso único (SEC-15).
   */
  async verifyEmail(token: string): Promise<void> {
    const record = await emailVerificationRepository.findValid(hashToken(token))
    if (!record) throw new InvalidVerificationTokenError()

    await userRepository.markEmailVerified(record.userId)
    await emailVerificationRepository.deleteForUser(record.userId)
  },

  /**
   * Reenvia o link para um endereço. Silencioso por design: não distingue
   * conta inexistente de conta já verificada, senão o formulário viraria um
   * verificador de quem tem cadastro aqui (SEC-17).
   */
  async resendVerificationEmail(email: string): Promise<void> {
    assertMailerConfigured()

    const user = await userRepository.findByEmail(email)
    if (!user || user.emailVerified) return

    try {
      await this.sendVerificationEmail(user)
    } catch (error) {
      logger.error('Falha ao reenviar e-mail de confirmação', error, {
        userId: user.id,
      })
    }
  },

  /** Verifica credenciais (usado pelo provider Credentials do Auth.js). */
  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<Pick<
    User,
    'id' | 'name' | 'email' | 'image' | 'role' | 'emailVerified'
  > | null> {
    const user = await userRepository.findByEmail(email)
    if (!user?.passwordHash) return null
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return null
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
    }
  },

  /**
   * Papel efetivo do usuário, lido do banco. O papel NUNCA vem do cliente;
   * quem chama passa apenas o id vindo da sessão já autenticada.
   */
  async findRole(userId: string): Promise<UserRole> {
    const user = await userRepository.findById(userId)
    return user?.role ?? 'user'
  },

  /**
   * Marca o endereço como confirmado sem passar por token. Uso restrito ao
   * login social, onde o provedor já comprovou a posse do endereço (RF-12).
   */
  async markEmailVerified(userId: string): Promise<void> {
    await userRepository.markEmailVerified(userId)
  },

  /**
   * Gera um token de recuperação e envia o link por e-mail. Nunca revela se o
   * e-mail existe (evita enumeração de usuários, SEC).
   */
  async requestPasswordReset(email: string): Promise<void> {
    // Antes do lookup, de propósito: um erro de configuração que só
    // aparecesse para e-mails existentes revelaria quais contas existem.
    assertMailerConfigured()

    const user = await userRepository.findByEmail(email)
    if (!user) return

    const token = randomBytes(32).toString('hex')
    await passwordResetRepository.deleteForUser(user.id)
    await passwordResetRepository.create(
      user.id,
      hashToken(token),
      new Date(Date.now() + RESET_TOKEN_TTL_MS),
    )

    const link = `${APP.url}${ROUTES.resetPassword}?token=${token}`

    try {
      await sendMail({
        to: user.email,
        subject: `${APP.name}, Recuperação de senha`,
        text: `Para redefinir sua senha, acesse: ${link}\nO link expira em 30 minutos.`,
      })
    } catch (error) {
      // Falha de entrega só ocorre quando a conta existe: propagá-la para a UI
      // reabriria a enumeração. O operador vê no log; o usuário vê a mesma
      // mensagem neutra de sempre e pode pedir um novo link.
      logger.error('Entrega do e-mail de recuperação falhou', error, {
        userId: user.id,
      })
    }
  },

  /** Redefine a senha a partir de um token válido. */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await passwordResetRepository.findValid(hashToken(token))
    if (!record) throw new InvalidResetTokenError()

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await userRepository.updatePasswordHash(record.userId, passwordHash)
    await passwordResetRepository.deleteForUser(record.userId)
  },
}
