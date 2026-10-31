# Guia do Projeto

## Fluxo de trabalho

Implemente direto. Spec/plan/tasks em `specs/` são **opcionais**: use só em
feature grande ou ambígua, cuja decisão valha registrar
(`/nova-feature <nome>` cria a pasta a partir de `specs/_template/`).
`specs/` e `.specify/memory/constitution.md` guardam decisões passadas;
consulte ao mexer na área correspondente.

Ambiente: `nvm use` (versão em `.nvmrc`) e `pnpm`.

## Arquitetura

Dependências num sentido só:

```
app / components → features / hooks → actions → services → repositories → db
```

- Query Drizzle **só** em `repositories/`. Regra de negócio **só** em
  `services/`; `actions/` apenas orquestra.
- Toda Server Action autenticada passa por `authAction`/`adminAction`
  (`lib/safe-action.ts`). Action pública valida a entrada com Zod mesmo assim.
- Schema Zod é a fonte da verdade dos tipos (`z.infer`), reusado no cliente e
  no servidor.
- Server Component por padrão; `'use client'` só em ilha interativa.
- Leitura de sessão passa por `lib/session.ts`. Dado de request
  (cookies/headers/sessão) fica sob `<Suspense>` (Cache Components +
  Partial Prefetching).

## Cache (`lib/cache.ts`, guia em `docs/caching.md`)

- Não cacheie o que já é estático.
- **Nunca** ponha dado por-usuário em `'use cache: remote'`: o cache é
  compartilhado entre visitantes. Cacheie por dimensão de poucos valores
  (idioma, categoria), nunca por `userId`.
- Perfis em `CACHE_PROFILES` e tags em `cacheTags`, nunca literais soltos.
- Invalide com `updateTag`, não `revalidatePath`. Mutação em dado não cacheado
  usa `refresh()` (ver `actions/task.actions.ts`).

## Segurança

- Só `NEXT_PUBLIC_*` no cliente. Secrets via `lib/env.server.ts`.
- Autorize por posse do recurso. Erro ao cliente sem detalhe sensível.
- Resposta que depende da existência de uma conta é idêntica em conteúdo e
  em tempo (ver `authService.verifyCredentials`).
- Endpoint público que consome token ou dispara e-mail passa por
  `checkRateLimit` (`lib/rate-limit.ts`).
- Override de dependência: menor versão corrigida no mesmo major, com escopo
  quando possível (regras em `SECURITY.md`).

## Gate

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Fluxo crítico (auth, mutação, autorização) também em `pnpm test:e2e`.
Mudou o schema: `pnpm db:generate` e revise o SQL antes de commitar.

## Convenções

- Arquivos em kebab-case; testes ao lado do código (`*.test.ts[x]`), E2E em
  `tests/e2e/`.
- Imports absolutos com `@/*`.
