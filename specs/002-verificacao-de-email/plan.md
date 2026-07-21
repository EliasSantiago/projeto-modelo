# Plano Técnico, Verificação de E-mail (Feature 002)

- **Spec:** [spec.md](./spec.md)
- **Data:** 2026-07-20
- **Constituição aplicável:** [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

---

## 1. Stack (apenas o que esta feature acrescenta)

| Área             | Escolha  | Versão | Por quê                                                                 |
| ---------------- | -------- | ------ | ----------------------------------------------------------------------- |
| Provedor de mail | `resend` | `6.x`  | API HTTP, sem porta SMTP bloqueada em serverless; pedido do stakeholder |

`nodemailer` já existia e permanece como provedor alternativo. Nenhuma outra
dependência nova.

## 2. Estrutura de Arquivos

```
src/
├── lib/mail/
│   ├── types.ts                    # contrato MailProvider + MailMessage
│   ├── index.ts                    # seleção do provedor + sendMail
│   └── providers/
│       ├── resend.ts               # API HTTP
│       ├── smtp.ts                 # nodemailer
│       └── console.ts              # dev, imprime no terminal
├── db/schema.ts                    # emailVerificationTokens
├── repositories/email-verification.repository.ts
├── services/auth.service.ts        # sendVerificationEmail, verifyEmail
├── actions/auth.actions.ts         # resendVerificationAction
├── schemas/auth.schema.ts          # verifyEmailSchema
└── app/(auth)/verify-email/page.tsx
```

`lib/mailer.ts` vira reexport de `lib/mail` para não quebrar import existente.

## 3. Decisões Arquiteturais (justificadas)

### D1, Abstração de provedor por interface, não por `if` no meio do envio

- **Contexto:** o pedido é usar Resend sem prender quem adota o template.
- **Alternativas:** (a) chamar o SDK do Resend direto no service; (b) `if`
  por provedor dentro de `sendMail`; (c) interface `MailProvider` com uma
  implementação por provedor.
- **Escolha:** (c). Acrescentar Postmark ou SES vira um arquivo novo, sem
  tocar em nada que já funciona.
- **Custo aceito:** uma camada de indireção a mais para ler.

### D2, Provedor resolvido por variável, com detecção automática

- **Contexto:** `pnpm dev` precisa subir sem nenhuma conta em SaaS.
- **Escolha:** `MAIL_PROVIDER` decide explicitamente; se ausente, escolhe
  Resend → SMTP → console, na ordem do que estiver configurado.
- **Custo aceito:** a mágica da detecção pode surpreender; mitigado por log
  do provedor escolhido no boot e por erro em produção quando cai no console.

### D3, Tabela dedicada, não a `verificationToken` do Auth.js

- **Contexto:** o adapter do Auth.js já tem uma tabela de tokens.
- **Escolha:** tabela própria `emailVerificationToken`, espelhando a de
  recuperação de senha (hash, expiração, FK para a conta).
- **Custo aceito:** uma tabela a mais. Em troca, o adapter continua dono da
  tabela dele: reaproveitá-la acoplaria nosso fluxo a um detalhe interno de
  biblioteca em beta, e um `deleteMany` do adapter poderia apagar nossos
  tokens.

### D4, Não bloquear login de conta não verificada por padrão

- **Contexto:** bloquear é a política mais segura, mas este é um template.
- **Escolha:** entregar `requireVerifiedUser()` pronto e não usá-lo no login.
- **Custo aceito:** por padrão a conta não verificada usa o produto. Quem
  quiser a política estrita liga em uma linha, documentada no README.

### D5, Falha de envio não derruba o cadastro

- **Contexto:** provedor de e-mail cai.
- **Escolha:** criar a conta, logar o erro, seguir. A pessoa pede novo link.
- **Custo aceito:** alguém pode terminar o cadastro sem receber a mensagem;
  é melhor que perder a conta por indisponibilidade de terceiro (SEC-19).

## 4. Fronteiras de Segurança (mapa → SEC-xx)

| Fronteira        | Mecanismo                                                        | SEC |
| ---------------- | ---------------------------------------------------------------- | --- |
| Token em repouso | `sha256` antes de gravar; valor cru só existe no link enviado    | 14  |
| Validade         | `expires` conferido na query; token apagado após uso             | 15  |
| Abuso de reenvio | `checkRateLimit('emailVerification')` antes de qualquer efeito   | 16  |
| Enumeração       | Resposta única para conta inexistente, existente e já verificada | 17  |
| Posse            | `userId` vem do token no banco, nunca da requisição              | 18  |
| Disponibilidade  | `try/catch` em volta do envio no fluxo de cadastro               | 19  |

## 5. Estratégia de Dados / Cache

- **Leitura:** `/verify-email` lê `searchParams` e a sessão, ambos dado de
  request: página inteira sob `<Suspense>` (Cache Components).
- **Escrita:** Server Action com `revalidatePath` não se aplica; após
  verificar, a página renderiza o resultado direto.
- O `emailVerified` entra no JWT no sign-in, como o `role`. Quem verifica
  durante a sessão só vê a mudança no próximo login: a página de confirmação
  informa isso em vez de mentir que já está tudo pronto.

## 6. Estratégia de Testes

| Camada   | O que testar                                                      | Ferramenta            |
| -------- | ----------------------------------------------------------------- | --------------------- |
| provedor | seleção por env, ordem de detecção, erro em produção sem provedor | Vitest                |
| service  | hash do token, uso único, expiração, posse, anti-enumeração       | Vitest (repo mockado) |
| provedor | Resend devolve erro em objeto (não lança): precisa virar exceção  | Vitest                |

## 7. Migrações / Rollout

- Migração `0002`: cria `emailVerificationToken`. Aditiva, sem backfill.
- `users.emailVerified` já existia e continua nulo para contas antigas: elas
  seguem funcionando, e ficam elegíveis a pedir o link.
- Rollback: derrubar a tabela. Nenhum dado existente depende dela.

## 8. Riscos & Mitigações

| Risco                                          | Impacto                     | Mitigação                                                |
| ---------------------------------------------- | --------------------------- | -------------------------------------------------------- |
| Domínio não verificado no Resend               | Envio recusado em produção  | Erro registrado com a mensagem do provedor; README avisa |
| Reenvio virar bomba de e-mail                  | Abuso, reputação de domínio | Rate limit por IP antes de qualquer envio (SEC-16)       |
| Alguém supor que `emailVerified` bloqueia algo | Falsa sensação de segurança | D4 documentado no README e no SECURITY.md                |
