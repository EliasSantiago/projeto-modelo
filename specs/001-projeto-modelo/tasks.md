# Tarefas — Projeto Modelo Next.js (Feature 001)

- **Referência:** [plan.md](./plan.md) · [spec.md](./spec.md)
- Ordem por dependência. `[P]` = paralelizável. Marque `[x]` ao concluir.

---

## Fase 0 — Fundação do projeto

- [x] T001 `package.json` com scripts (dev/build/start/lint/format/typecheck/test/e2e/db:*) e deps fixadas
- [x] T002 `tsconfig.json` strict + alias `@/*`
- [x] T003 `next.config.ts` (cacheComponents, images remotePatterns)
- [x] T004 Tailwind v4: `postcss.config.mjs` + `app/globals.css` (`@import "tailwindcss"`, `@theme`)
- [x] T005 ESLint flat (`eslint.config.mjs`) + `prettier.config.mjs` + `.prettierignore`
- [x] T006 `.gitignore`, `.npmrc`, `.editorconfig`, `.nvmrc`
- [x] T007 `.env.example` documentando todas as variáveis

## Fase 1 — Núcleo transversal (config/env/utils)

- [x] T010 `lib/env.server.ts` (Zod, `server-only`) e `lib/env.client.ts` (`NEXT_PUBLIC_*`) — SEC-01
- [x] T011 `lib/utils.ts` (`cn`) e `utils/` puros [P]
- [x] T012 `constants/` (rotas, app config) [P]
- [x] T013 `types/` globais e augmentation de sessão [P]

## Fase 2 — Banco de dados (Drizzle + Neon)

- [x] T020 `db/schema.ts` — tabelas Auth.js + `tasks` (`server-only`) — SEC-02
- [x] T021 `db/client.ts` — Neon serverless + drizzle (`server-only`)
- [x] T022 `drizzle.config.ts` — migrations
- [x] T023 `db/seed.ts` — seed opcional

## Fase 3 — Autenticação (Auth.js v5)

- [x] T030 `lib/auth.ts` — NextAuth (Google, GitHub, Email), Drizzle adapter, cookies seguros — SEC-06
- [x] T031 `app/api/auth/[...nextauth]/route.ts`
- [x] T032 `proxy.ts` — gate de rotas privadas — RF-02
- [x] T033 helpers `lib/session.ts` (`getCurrentUser`, `requireUser`) — SEC-04

## Fase 4 — Camadas de aplicação (schemas → repos → services → actions)

- [x] T040 `schemas/task.schema.ts` (Zod) — fonte da verdade — RF-04/SEC-03
- [x] T041 `repositories/task.repository.ts` — queries Drizzle parametrizadas — SEC-05
- [x] T042 `services/task.service.ts` — regras de negócio + posse do recurso — SEC-04
- [x] T043 `lib/safe-action.ts` — `authActionClient` (valida+autoriza) + tratamento de erro — SEC-07
- [x] T044 `actions/task.actions.ts` — create/update/delete via safe-action + revalidate

## Fase 5 — UI e Providers

- [x] T050 `providers/theme-provider.tsx` + `components/layout/theme-toggle.tsx` — RF-05 [P]
- [x] T051 ShadCN: `components/ui` (button, input, card, form, etc.) [P]
- [x] T052 `components/layout/header.tsx` (estado de sessão) + footer — RF-07
- [x] T053 `app/layout.tsx` root (next/font, providers, metadata)
- [x] T054 `app/(public)/page.tsx` landing + `app/(public)/login/page.tsx`

## Fase 6 — Feature de referência (tasks) ponta-a-ponta

- [x] T060 `features/tasks/` — form (RHF+Zod), lista, item
- [x] T061 `app/(protected)/dashboard/page.tsx` — Server Component + Suspense — RF-03/RF-06
- [x] T062 `app/(protected)/layout.tsx` — `requireUser` (defesa em profundidade)
- [x] T063 `loading.tsx` + `error.tsx` (público e privado) — RF-06

## Fase 7 — Testes

- [x] T070 `vitest.config.ts` + `src/test/setup.ts`
- [x] T071 Testes unit: schema, service (repo mockado), util
- [x] T072 Teste de componente: form de task
- [x] T073 `playwright.config.ts` + `tests/e2e/` (login + CRUD) — RNF-05

## Fase 8 — Qualidade & Documentação

- [x] T080 Husky + lint-staged (`pre-commit`) — RNF-04
- [x] T081 `README.md` (visão, instalação, scripts, deploy, decisões) — DOC
- [x] T082 `AGENTS.md`/`CLAUDE.md` (guia de contribuição p/ IA e humanos)
- [x] T083 Verificação final: `pnpm install && pnpm typecheck && pnpm lint && pnpm build`

## Rastreabilidade RF/SEC → Tarefas

- RF-01 → T030-T033, T054 · RF-02 → T032/T062 · RF-03 → T040-T044,T060-T061
- RF-04 → T040,T060 · RF-05 → T050 · RF-06 → T061,T063 · RF-07 → T052,T054
- SEC-01 → T010 · SEC-02 → T020-T021 · SEC-03 → T040,T044 · SEC-04 → T033,T042,T043
- SEC-05 → T041 · SEC-06 → T030 · SEC-07 → T043
