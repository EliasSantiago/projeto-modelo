# Tarefas, Manutenção de Dependências e Endurecimento (Feature 004)

- **Referência:** [plan.md](./plan.md) · [spec.md](./spec.md)
- Ordem por dependência. `[P]` = paralelizável. Marque `[x]` ao concluir.

> Lista escrita retroativamente; ver a nota de processo em [spec.md](./spec.md).
> As tarefas estão marcadas porque descrevem trabalho já feito e validado.

---

## Fase 0, Dependências

- [x] T001 `package.json` — minor/patch de todas as dependências (RF-01)
- [x] T002 `package.json` — majors compatíveis: `nodemailer`, `vitest`,
      `jsdom`, `jest-dom`, `@hookform/resolvers`, `motion`, `dotenv`,
      `prettier-plugin-tailwindcss`; `vite` explícito; sai
      `@types/nodemailer` (RF-01)
- [x] T003 `package.json` — overrides com escopo, sem rebaixar major; saem os
      redundantes (RNF-01, RNF-02)
- [x] T004 `package.json` — `engines` e `packageManager` (RNF-04)
- [x] T005 [P] `eslint.config.mjs`, `drizzle.config.ts`, `src/db/seed.ts` —
      comentário de versão corrigido; `dotenv` silencioso

## Fase 1, Framework

- [x] T010 `next.config.ts` — `partialPrefetching: true` (RF-03)
- [x] T011 `src/lib/session.ts` — `connection()` antes de `auth()`; mock nos
      testes de sessão e do invólucro de action (RF-04)
- [x] T012 `src/proxy.ts` — export `config` (RF-02)

## Fase 2, Domínio

- [x] T020 `src/schemas/auth.schema.ts` — limite de senha em bytes; schema de
      provedor social; `auth.schema.test.ts` novo (RF-05, SEC-28, SEC-30)
- [x] T021 `src/actions/auth.actions.ts` — validar o provedor social (SEC-30)
- [x] T022 `src/repositories/{password-reset,email-verification}.repository.ts`
      — `consumeValid` atômico no lugar de `findValid` (SEC-29)
- [x] T023 `src/services/auth.service.ts` — consumir antes do efeito; teste de
      ordem (SEC-29)
- [x] T024 `src/lib/rate-limit.ts` — `x-real-ip` antes de `x-forwarded-for`;
      teste de cabeçalho forjado (SEC-31)

## Fase 3, Entrega

- [x] T030 `.github/workflows/ci.yml` — Actions v7/v6, `permissions`,
      `persist-credentials: false` (SEC-32)
- [x] T031 [P] `SECURITY.md`, `README.md`, `specs/001-projeto-modelo/plan.md`
      — regra de escopo de override, advisories aceitos, limitação de sessão
      após redefinição de senha, versões
- [x] T032 Gate: typecheck, lint, format, 103 testes, build, E2E (8) contra
      build de produção, `pnpm audit --audit-level high`
