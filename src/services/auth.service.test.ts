import { beforeEach, describe, expect, it, vi } from 'vitest'
import bcrypt from 'bcryptjs'

vi.mock('@/repositories/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updatePasswordHash: vi.fn(),
    markEmailVerified: vi.fn(),
  },
}))

vi.mock('@/repositories/email-verification.repository', () => ({
  emailVerificationRepository: {
    create: vi.fn(),
    findValid: vi.fn(),
    deleteForUser: vi.fn(),
  },
}))

vi.mock('@/repositories/password-reset.repository', () => ({
  passwordResetRepository: {
    create: vi.fn(),
    findValid: vi.fn(),
    deleteForUser: vi.fn(),
  },
}))

vi.mock('@/lib/mailer', () => ({
  sendMail: vi.fn(),
  assertMailerConfigured: vi.fn(),
}))

import { userRepository } from '@/repositories/user.repository'
import { passwordResetRepository } from '@/repositories/password-reset.repository'
import { emailVerificationRepository } from '@/repositories/email-verification.repository'
import { assertMailerConfigured, sendMail } from '@/lib/mailer'
import {
  authService,
  EmailInUseError,
  InvalidResetTokenError,
  InvalidVerificationTokenError,
} from './auth.service'

const mockUsers = vi.mocked(userRepository)
const mockTokens = vi.mocked(passwordResetRepository)
const mockVerify = vi.mocked(emailVerificationRepository)
const mockSendMail = vi.mocked(sendMail)
const mockAssertMailer = vi.mocked(assertMailerConfigured)

const existingUser = {
  id: 'user-1',
  name: 'Fulano',
  email: 'fulano@example.com',
  emailVerified: null,
  image: null,
  passwordHash: null as string | null,
  role: 'user' as const,
}

describe('authService.register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('recusa e-mail já cadastrado', async () => {
    mockUsers.findByEmail.mockResolvedValue(existingUser)

    await expect(
      authService.register({
        name: 'Outro',
        email: 'fulano@example.com',
        password: 'senha-forte-123',
      }),
    ).rejects.toBeInstanceOf(EmailInUseError)

    expect(mockUsers.create).not.toHaveBeenCalled()
  })

  it('nunca persiste a senha em texto puro', async () => {
    mockUsers.findByEmail.mockResolvedValue(null)
    mockUsers.create.mockResolvedValue(existingUser)

    await authService.register({
      name: 'Novo',
      email: 'novo@example.com',
      password: 'senha-forte-123',
    })

    const saved = mockUsers.create.mock.calls[0]![0]
    expect(saved.passwordHash).toBeDefined()
    expect(saved.passwordHash).not.toBe('senha-forte-123')
    // O hash precisa validar contra a senha original.
    await expect(
      bcrypt.compare('senha-forte-123', saved.passwordHash!),
    ).resolves.toBe(true)
  })
})

describe('authService.verifyCredentials', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejeita usuário inexistente', async () => {
    mockUsers.findByEmail.mockResolvedValue(null)
    await expect(
      authService.verifyCredentials('nao@existe.com', 'x'),
    ).resolves.toBeNull()
  })

  it('rejeita conta sem senha (criada só via OAuth)', async () => {
    mockUsers.findByEmail.mockResolvedValue({
      ...existingUser,
      passwordHash: null,
    })
    await expect(
      authService.verifyCredentials('fulano@example.com', 'qualquer'),
    ).resolves.toBeNull()
  })

  it('rejeita senha errada', async () => {
    mockUsers.findByEmail.mockResolvedValue({
      ...existingUser,
      passwordHash: await bcrypt.hash('senha-certa', 10),
    })
    await expect(
      authService.verifyCredentials('fulano@example.com', 'senha-errada'),
    ).resolves.toBeNull()
  })

  it('devolve o usuário com o papel, e nunca o hash da senha', async () => {
    mockUsers.findByEmail.mockResolvedValue({
      ...existingUser,
      role: 'admin',
      passwordHash: await bcrypt.hash('senha-certa', 10),
    })

    const result = await authService.verifyCredentials(
      'fulano@example.com',
      'senha-certa',
    )

    expect(result).toMatchObject({ id: 'user-1', role: 'admin' })
    expect(result).not.toHaveProperty('passwordHash')
  })
})

describe('authService.requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // `clearAllMocks` zera chamadas, não implementações: sem estes resets, o
    // throw montado num teste vazaria para os seguintes.
    mockAssertMailer.mockReset()
    mockSendMail.mockReset()
  })

  it('checa a configuração de e-mail ANTES de consultar o usuário', async () => {
    // Se a ordem inverter, o erro de configuração só apareceria para contas
    // existentes e viraria um oráculo de enumeração (SEC-10).
    mockAssertMailer.mockImplementation(() => {
      throw new Error('não configurado')
    })

    await expect(
      authService.requestPasswordReset('fulano@example.com'),
    ).rejects.toThrow()

    expect(mockUsers.findByEmail).not.toHaveBeenCalled()
  })

  it('não envia nada, e não falha, para e-mail inexistente', async () => {
    mockUsers.findByEmail.mockResolvedValue(null)

    await expect(
      authService.requestPasswordReset('nao@existe.com'),
    ).resolves.toBeUndefined()

    expect(mockSendMail).not.toHaveBeenCalled()
    expect(mockTokens.create).not.toHaveBeenCalled()
  })

  it('guarda o hash do token, nunca o valor cru', async () => {
    mockUsers.findByEmail.mockResolvedValue(existingUser)

    await authService.requestPasswordReset('fulano@example.com')

    const [, storedHash] = mockTokens.create.mock.calls[0]!
    const sentBody = mockSendMail.mock.calls[0]![0].text
    const rawToken = sentBody.match(/token=([a-f0-9]+)/)?.[1]

    expect(rawToken).toBeDefined()
    expect(storedHash).not.toBe(rawToken)
    expect(storedHash).toHaveLength(64) // sha256 hex
  })

  it('invalida tokens anteriores ao emitir um novo', async () => {
    mockUsers.findByEmail.mockResolvedValue(existingUser)
    await authService.requestPasswordReset('fulano@example.com')
    expect(mockTokens.deleteForUser).toHaveBeenCalledWith('user-1')
  })

  it('engole falha de entrega para não revelar que a conta existe', async () => {
    mockUsers.findByEmail.mockResolvedValue(existingUser)
    mockSendMail.mockRejectedValue(new Error('SMTP fora do ar'))

    await expect(
      authService.requestPasswordReset('fulano@example.com'),
    ).resolves.toBeUndefined()
  })
})

describe('authService.resetPassword', () => {
  beforeEach(() => vi.clearAllMocks())

  it('recusa token inválido ou expirado', async () => {
    mockTokens.findValid.mockResolvedValue(null)

    await expect(
      authService.resetPassword('token-qualquer', 'nova-senha-123'),
    ).rejects.toBeInstanceOf(InvalidResetTokenError)

    expect(mockUsers.updatePasswordHash).not.toHaveBeenCalled()
  })

  it('procura pelo hash do token, não pelo valor recebido', async () => {
    mockTokens.findValid.mockResolvedValue(null)

    await authService
      .resetPassword('token-cru', 'nova-senha-123')
      .catch(() => undefined)

    expect(mockTokens.findValid).toHaveBeenCalledWith(
      expect.not.stringContaining('token-cru'),
    )
  })

  it('troca a senha e queima o token usado', async () => {
    mockTokens.findValid.mockResolvedValue({
      id: 't1',
      userId: 'user-1',
      tokenHash: 'hash',
      expires: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    })

    await authService.resetPassword('token-cru', 'nova-senha-123')

    const [userId, newHash] = mockUsers.updatePasswordHash.mock.calls[0]!
    expect(userId).toBe('user-1')
    await expect(bcrypt.compare('nova-senha-123', newHash)).resolves.toBe(true)
    // Token de uso único: some depois de aplicado.
    expect(mockTokens.deleteForUser).toHaveBeenCalledWith('user-1')
  })
})

describe('authService.sendVerificationEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendMail.mockReset()
  })

  it('guarda o hash do token, nunca o valor cru (SEC-14)', async () => {
    await authService.sendVerificationEmail(existingUser)

    const [, storedHash] = mockVerify.create.mock.calls[0]!
    const rawToken =
      mockSendMail.mock.calls[0]![0].text.match(/token=([a-f0-9]+)/)?.[1]

    expect(rawToken).toBeDefined()
    expect(storedHash).not.toBe(rawToken)
    expect(storedHash).toHaveLength(64) // sha256 hex
  })

  it('invalida convites anteriores ao emitir um novo', async () => {
    await authService.sendVerificationEmail(existingUser)
    expect(mockVerify.deleteForUser).toHaveBeenCalledWith('user-1')
  })

  it('emite convite com validade futura', async () => {
    await authService.sendVerificationEmail(existingUser)

    const [, , expires] = mockVerify.create.mock.calls[0]!
    expect(expires.getTime()).toBeGreaterThan(Date.now())
  })
})

describe('authService.verifyEmail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('recusa token inválido ou expirado (SEC-15)', async () => {
    // `findValid` já filtra expirados na query: ausência cobre os dois casos.
    mockVerify.findValid.mockResolvedValue(null)

    await expect(authService.verifyEmail('qualquer')).rejects.toBeInstanceOf(
      InvalidVerificationTokenError,
    )
    expect(mockUsers.markEmailVerified).not.toHaveBeenCalled()
  })

  it('procura pelo hash, não pelo token recebido', async () => {
    mockVerify.findValid.mockResolvedValue(null)
    await authService.verifyEmail('token-cru').catch(() => undefined)

    expect(mockVerify.findValid).toHaveBeenCalledWith(
      expect.not.stringContaining('token-cru'),
    )
  })

  it('verifica a conta dona do convite, não outra (SEC-18)', async () => {
    mockVerify.findValid.mockResolvedValue({
      id: 'v1',
      userId: 'dono-do-token',
      tokenHash: 'hash',
      expires: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    })

    await authService.verifyEmail('token-cru')

    expect(mockUsers.markEmailVerified).toHaveBeenCalledWith('dono-do-token')
  })

  it('queima o convite depois de usar, tornando o link de uso único', async () => {
    mockVerify.findValid.mockResolvedValue({
      id: 'v1',
      userId: 'user-1',
      tokenHash: 'hash',
      expires: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    })

    await authService.verifyEmail('token-cru')

    expect(mockVerify.deleteForUser).toHaveBeenCalledWith('user-1')
  })
})

describe('authService.resendVerificationEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAssertMailer.mockReset()
    mockSendMail.mockReset()
  })

  it('não envia nada para e-mail inexistente (SEC-17)', async () => {
    mockUsers.findByEmail.mockResolvedValue(null)

    await expect(
      authService.resendVerificationEmail('nao@existe.com'),
    ).resolves.toBeUndefined()
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('não reenvia para conta já verificada, e não acusa isso', async () => {
    mockUsers.findByEmail.mockResolvedValue({
      ...existingUser,
      emailVerified: new Date(),
    })

    await expect(
      authService.resendVerificationEmail('fulano@example.com'),
    ).resolves.toBeUndefined()
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('envia para conta pendente', async () => {
    mockUsers.findByEmail.mockResolvedValue(existingUser)

    await authService.resendVerificationEmail('fulano@example.com')

    expect(mockSendMail).toHaveBeenCalled()
  })

  it('checa a configuração antes de consultar o usuário (SEC-17)', async () => {
    mockAssertMailer.mockImplementation(() => {
      throw new Error('não configurado')
    })

    await expect(
      authService.resendVerificationEmail('fulano@example.com'),
    ).rejects.toThrow()
    expect(mockUsers.findByEmail).not.toHaveBeenCalled()
  })

  it('falha de entrega não vaza para quem chamou', async () => {
    mockUsers.findByEmail.mockResolvedValue(existingUser)
    mockSendMail.mockRejectedValue(new Error('provedor fora do ar'))

    await expect(
      authService.resendVerificationEmail('fulano@example.com'),
    ).resolves.toBeUndefined()
  })
})

describe('authService.register, envio de confirmação', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendMail.mockReset()
  })

  it('dispara o e-mail de confirmação ao criar a conta', async () => {
    mockUsers.findByEmail.mockResolvedValue(null)
    mockUsers.create.mockResolvedValue(existingUser)

    await authService.register({
      name: 'Novo',
      email: 'novo@example.com',
      password: 'senha-forte-123',
    })

    expect(mockSendMail).toHaveBeenCalled()
  })

  it('cria a conta mesmo se o provedor de e-mail estiver fora (SEC-19)', async () => {
    mockUsers.findByEmail.mockResolvedValue(null)
    mockUsers.create.mockResolvedValue(existingUser)
    mockSendMail.mockRejectedValue(new Error('provedor fora do ar'))

    await expect(
      authService.register({
        name: 'Novo',
        email: 'novo@example.com',
        password: 'senha-forte-123',
      }),
    ).resolves.toMatchObject({ id: 'user-1' })
  })
})

describe('authService.findRole', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devolve o papel do banco', async () => {
    mockUsers.findById.mockResolvedValue({ ...existingUser, role: 'admin' })
    await expect(authService.findRole('user-1')).resolves.toBe('admin')
  })

  it('cai para o papel menos privilegiado quando o usuário some', async () => {
    mockUsers.findById.mockResolvedValue(null)
    await expect(authService.findRole('sumiu')).resolves.toBe('user')
  })
})
