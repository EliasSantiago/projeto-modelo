# Tarefas, Verificação de E-mail (Feature 002)

- **Referência:** [plan.md](./plan.md) · [spec.md](./spec.md)
- Ordem por dependência. `[P]` = paralelizável. Marque `[x]` ao concluir.

---

## Fase 0, Provedor de e-mail

- [x] T001 `src/lib/mail/types.ts` — contrato `MailProvider`/`MailMessage` (RF-14)
- [x] T002 `src/lib/mail/providers/console.ts` — imprime no terminal, padrão em dev
- [x] T003 `src/lib/mail/providers/smtp.ts` — nodemailer, extraído do antigo `mailer.ts`
- [x] T004 `src/lib/mail/providers/resend.ts` — SDK; erro vem em objeto, converter em exceção
- [x] T005 `src/lib/mail/index.ts` — seleção por `MAIL_PROVIDER` + detecção automática (D2)
- [x] T006 `src/lib/mailer.ts` — reexport, mantém imports existentes funcionando
- [x] T007 `src/lib/env.server.ts` — `MAIL_PROVIDER`, `RESEND_API_KEY`, `MAIL_FROM`

## Fase 1, Dados

- [x] T010 `src/db/schema.ts` — tabela `emailVerificationToken` (SEC-14)
- [x] T011 `pnpm db:generate` e revisar o SQL antes de commitar
- [x] T012 `src/repositories/email-verification.repository.ts` — única camada com Drizzle
- [x] T013 `src/repositories/user.repository.ts` — `markEmailVerified`

## Fase 2, Domínio

- [x] T020 `src/schemas/auth.schema.ts` — `verifyEmailSchema`
- [x] T021 `src/services/auth.service.ts` — `sendVerificationEmail` (SEC-14/15)
- [x] T022 `src/services/auth.service.ts` — `verifyEmail`, uso único e posse (SEC-15/18)
- [x] T023 `src/services/auth.service.ts` — `register` dispara o envio sem quebrar (SEC-19)
- [x] T024 `src/lib/rate-limit.ts` — bucket `emailVerification` (SEC-16)
- [x] T025 `src/actions/auth.actions.ts` — `resendVerificationAction` (SEC-16/17)

## Fase 3, Interface

- [x] T030 `src/app/(auth)/verify-email/page.tsx` — resultado da confirmação, sob `<Suspense>`
- [x] T031 `src/features/auth/resend-verification.tsx` — ilha de cliente do reenvio
- [x] T032 `src/constants/routes.ts` — rota `verifyEmail`

## Fase 4, Sessão

- [x] T040 `src/lib/auth.ts` — `emailVerified` no JWT e na sessão (RF-13)
- [x] T041 `src/types/next-auth.d.ts` — augmentation
- [x] T042 `src/lib/session.ts` — `requireVerifiedUser` (D4, opcional por padrão)
- [x] T043 `src/lib/auth.ts` — conta social nasce verificada (RF-12)

## Fase 5, Testes

- [x] T050 `src/lib/mail/index.test.ts` — seleção e ordem de detecção [P]
- [x] T051 `src/lib/mail/providers/resend.test.ts` — erro em objeto vira exceção [P]
- [x] T052 `src/services/auth.service.test.ts` — hash, uso único, expiração, posse [P]

## Fase 6, Fechamento

- [x] T060 `pnpm typecheck && pnpm lint && pnpm test && pnpm build` verdes
- [x] T061 `.env.example`, README e SECURITY.md atualizados
- [x] T062 SEC-14..SEC-19 registrados na spec desta feature
