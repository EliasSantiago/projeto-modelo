import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

/**
 * Schema Drizzle, fonte da verdade do banco.
 * Tabelas do Auth.js (users/accounts/sessions/verificationTokens) seguem o
 * formato esperado pelo @auth/drizzle-adapter. Tabela `tasks` é a feature
 * de referência.
 */

// --- Auth.js -------------------------------------------------------------

/**
 * Papéis de acesso. Fonte da verdade do RBAC: o enum vive no banco, o tipo
 * TypeScript deriva dele. Para um novo papel, adicione aqui e gere a migração.
 */
export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const USER_ROLES = userRoleEnum.enumValues
export type UserRole = (typeof USER_ROLES)[number]

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  // Hash da senha (bcrypt). Nulo para contas criadas só via OAuth.
  passwordHash: text('passwordHash'),
  // Papel de acesso. Default 'user': privilégio se concede, nunca se assume.
  role: userRoleEnum('role').notNull().default('user'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
)

// --- Recuperação de senha ------------------------------------------------
export const passwordResetTokens = pgTable('passwordResetToken', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // Guardamos o hash do token, nunca o valor cru (SEC).
  tokenHash: text('tokenHash').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
})

// --- Verificação de e-mail (feature 002) --------------------------------

/**
 * Convites de confirmação de e-mail.
 *
 * Tabela própria, e não a `verificationToken` do Auth.js: aquela pertence ao
 * adapter, que a limpa por conta própria. Acoplar nosso fluxo a um detalhe
 * interno de biblioteca em beta sairia caro (plan.md, D3).
 */
export const emailVerificationTokens = pgTable('emailVerificationToken', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // Hash do token, nunca o valor cru (SEC-14).
  tokenHash: text('tokenHash').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
})

// --- Feature de referência: tasks ---------------------------------------
export const tasks = pgTable('task', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
