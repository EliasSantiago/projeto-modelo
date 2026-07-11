import 'server-only'
import { randomBytes, createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { userRepository } from '@/repositories/user.repository'
import { passwordResetRepository } from '@/repositories/password-reset.repository'
import { sendMail } from '@/lib/mailer'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'
import type { User } from '@/db/schema'

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

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30 // 30 minutos
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
    return userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    })
  },

  /** Verifica credenciais (usado pelo provider Credentials do Auth.js). */
  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<Pick<User, 'id' | 'name' | 'email' | 'image'> | null> {
    const user = await userRepository.findByEmail(email)
    if (!user?.passwordHash) return null
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return null
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    }
  },

  /**
   * Gera um token de recuperação e envia o link por e-mail. Nunca revela se o
   * e-mail existe (evita enumeração de usuários, SEC).
   */
  async requestPasswordReset(email: string): Promise<void> {
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
    await sendMail({
      to: user.email,
      subject: `${APP.name}, Recuperação de senha`,
      text: `Para redefinir sua senha, acesse: ${link}\nO link expira em 30 minutos.`,
    })
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
