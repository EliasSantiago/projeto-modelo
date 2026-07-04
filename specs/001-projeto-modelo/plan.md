# Plano Técnico — Projeto Modelo Next.js (Feature 001)

- **Referencia:** [spec.md](./spec.md) · [constitution.md](../../.specify/memory/constitution.md)
- **Data:** 2026-07-04

---

## 1. Stack (versões reais, verificadas em 2026-07-04)

| Área            | Escolha                                                 | Versão                                  |
| --------------- | ------------------------------------------------------- | --------------------------------------- |
| Framework       | Next.js (App Router, RSC, Server Actions, Turbopack)    | `16.2.10`                               |
| Runtime UI      | React / React DOM                                       | `19.2.7`                                |
| Linguagem       | TypeScript (strict)                                     | `6.0.3`                                 |
| Estilo          | Tailwind CSS (CSS-first, `@tailwindcss/postcss`)        | `4.3.2`                                 |
| Componentes     | ShadCN/UI (Radix + CVA)                                 | CLI `canary`                            |
| Ícones          | Heroicons                                               | `2.2.0`                                 |
| Animação        | Framer Motion (`motion`)                                | `12.42.2`                               |
| Tema            | next-themes                                             | `0.4.6`                                 |
| Formulários     | React Hook Form + `@hookform/resolvers`                 | `7.80.0` / `5.4.0`                      |
| Validação       | Zod                                                     | `4.4.3`                                 |
| ORM             | Drizzle ORM + Drizzle Kit                               | `0.45.2` / `0.31.10`                    |
| Banco           | Neon Postgres (`@neondatabase/serverless`)              | `1.1.0`                                 |
| Auth            | Auth.js v5 (`next-auth@beta`) + `@auth/drizzle-adapter` | `5.0.0-beta.31` / `1.11.2`              |
| Estado cliente  | Zustand (quando necessário)                             | `5.0.14`                                |
| Testes unit     | Vitest + Testing Library + jsdom                        | `4.1.9`                                 |
| Testes E2E      | Playwright                                              | `1.61.1`                                |
| Qualidade       | ESLint (flat) + Prettier + Husky + lint-staged          | `9.39.4` / `3.9.4` / `9.1.7` / `17.0.8` |
| Package manager | pnpm                                                    | `10.x`                                  |

## 2. Estrutura de Pastas (contrato de arquitetura)

```
src/
  app/                 # App Router: rotas, layouts, loading, error
    (public)/          #   grupo público (landing, auth)
    (protected)/       #   grupo privado (dashboard) — gated por proxy/layout
    api/               #   route handlers (webhooks/auth se necessário)
  components/
    ui/                # ShadCN/UI (apresentacional puro)
    layout/            # header, footer, theme-toggle
  features/            # feature-slices (ex.: tasks) — UI + wiring da feature
  services/            # regras de negócio; orquestram repositories
  repositories/        # ÚNICO acesso ao Drizzle (queries parametrizadas)
  db/                  # schema Drizzle, client, migrations, seed
  actions/             # Server Actions (valida Zod + autoriza + chama service)
  schemas/             # schemas Zod (fonte da verdade dos tipos)
  hooks/               # hooks de cliente reutilizáveis
  lib/                 # infra: auth, env, utils base (cn), server-only guards
  providers/           # Client providers (theme, etc.)
  types/               # tipos globais / augmentations
  utils/               # funções puras sem dependência de framework
  constants/           # constantes e config estática
  test/                # setup e helpers de teste
tests/e2e/             # specs Playwright
specs/                 # artefatos SDD (spec/plan/tasks)
.specify/memory/       # constitution
```

Regra de dependência (Princípio IV): UI → features → actions → services → repositories → db.
`schemas`, `types`, `lib`, `utils`, `constants` são transversais e **não** importam UI.

## 3. Decisões Arquiteturais (justificadas — Princípio VII)

- **App Router + RSC como padrão.** Menos JS no cliente, dados no servidor,
  streaming nativo. `'use client'` só em ilhas interativas.
- **Server Actions para mutação** em vez de rotas REST internas: menos boilerplate,
  type-safe fim-a-fim, e ponto natural para validar+autorizar (SEC-03/04).
- **Repository pattern isolando o Drizzle:** troca de ORM/DB ou adição de cache
  fica contida numa camada; services não conhecem SQL.
- **Zod como fonte da verdade:** um schema gera validação (cliente e servidor) e
  os tipos (`z.infer`). Elimina drift tipo↔validação (RF-04, RNF-03).
- **Env validado em dois arquivos** (`env.server.ts` / `env.client.ts`) com
  `server-only`: impossível vazar secret para o bundle do cliente (SEC-01).
- **Neon serverless (driver HTTP):** compatível com Fluid Compute/serverless da
  Vercel, sem gerenciar pool de conexões (RNF-07).
- **Auth.js v5 + Drizzle adapter:** sessão em cookie `HttpOnly/Secure/SameSite`,
  provedores e-mail/Google/GitHub, augmentation de `session.user.id` (SEC-06).
- **Tailwind v4 CSS-first:** config em CSS (`@theme`), sem `tailwind.config.js`,
  build mais rápido; ShadCN suportado.
- **Proteção de rota em duas camadas:** `proxy.ts` (redireciona cedo) **e**
  checagem de sessão dentro das Actions/loaders (defesa em profundidade, SEC-04).
- **`next-safe-action`-like manual:** wrapper `authActionClient` padroniza
  validação+autorização em toda Action, sem confiar no chamador.

## 4. Fronteiras de Segurança (mapa → SEC-xx)

| Fronteira | Mecanismo                                                               | SEC |
| --------- | ----------------------------------------------------------------------- | --- |
| Env       | `env.server.ts` (`server-only`) vs `env.client.ts` (só `NEXT_PUBLIC_*`) | 01  |
| DB        | `import 'server-only'` em `db/` e `repositories/`                       | 02  |
| Entrada   | `schema.parse()` no topo de cada Action                                 | 03  |
| AuthZ     | `authActionClient` + verificação de posse do recurso                    | 04  |
| SQL       | Drizzle query builder (parametrizado)                                   | 05  |
| Sessão    | Config de cookie do Auth.js                                             | 06  |
| Erros     | `try/catch` → mensagem genérica ao cliente, `console.error` no server   | 07  |

## 5. Estratégia de Dados / Cache

- Leituras do dashboard: Server Component + `Suspense` (streaming) para a lista.
- Dados estáveis/públicos: `use cache` + `cacheLife` quando aplicável.
- Mutação → `revalidatePath`/`revalidateTag` para refletir na UI.
- `cacheComponents: true` habilitado no `next.config.ts` (PPR).

## 6. Estratégia de Testes (RNF-05)

- **Unit (Vitest):** schemas (validação), utils, services (com repo mockado).
- **Componente (Testing Library):** componentes de UI críticos e forms.
- **E2E (Playwright):** fluxo de login e CRUD de tasks ponta-a-ponta.
- Gate: `pnpm test` (unit) no CI local; E2E sob demanda / pré-deploy.

## 7. Deploy (RNF-07)

- Alvo: Vercel + Neon. Config por env; `vercel env pull` para local.
- `drizzle-kit generate` + `migrate` no fluxo de release.
- README traz guia de instalação e de deploy passo a passo.

## 8. Riscos & Mitigações

| Risco                                  | Mitigação                                                |
| -------------------------------------- | -------------------------------------------------------- |
| Auth.js v5 em beta                     | Fixar versão; isolar em `lib/auth`; cobrir com E2E       |
| TS 6 / Tailwind 4 / ESLint 10 recentes | Configs mínimas e documentadas; build no CI local valida |
| Vazamento de secret                    | Separação server/client de env + `server-only` + revisão |
| Provedor de e-mail em dev              | Transporte de log/console; SMTP real só em prod          |
