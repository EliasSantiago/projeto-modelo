# Guia de Contribuição (humanos e agentes de IA)

Este projeto segue **Spec-Driven Development**. Leia antes de codar.

## Ordem de trabalho (obrigatória)

```
constitution → spec → plan → tasks → implementação
```

1. **Constituição** — princípios inegociáveis: `.specify/memory/constitution.md`.
2. **Spec** (`specs/<n>-<feature>/spec.md`) — o quê e por quê. Sem stack.
3. **Plan** (`plan.md`) — como. Decisões técnicas justificadas.
4. **Tasks** (`tasks.md`) — passos rastreáveis, ordenados por dependência.
5. **Implementação** — só depois dos 4 acima.

Para uma nova feature, copie a pasta `specs/001-projeto-modelo` como modelo.

## Regras de arquitetura (Princípio IV da constituição)

Dependências num sentido só:

```
app / components → features / hooks → actions → services → repositories → db
```

- **Nunca** faça query Drizzle fora de `repositories/`.
- **Nunca** coloque regra de negócio em `actions/` — orquestre `services/`.
- Toda Server Action passa por `authAction` (`lib/safe-action.ts`):
  autentica → valida (Zod) → autoriza → executa com erro seguro.
- Schema Zod é a fonte da verdade dos tipos (`z.infer`), reusado no cliente e
  no servidor.
- `'use client'` só em ilhas interativas. Padrão é Server Component.
- Dado de request (cookies/headers/`auth()`) que não é cacheado precisa estar
  dentro de `<Suspense>` (Cache Components / PPR).

## Segurança (Princípio III — sempre)

- Só `NEXT_PUBLIC_*` no cliente. Secrets via `lib/env.server.ts` (`server-only`).
- Banco só no servidor. Queries parametrizadas. Valide toda entrada.
- Autorize por posse do recurso. Erros sem detalhe sensível ao cliente.

## Antes de commitar

O hook de `pre-commit` (Husky + lint-staged) roda ESLint + Prettier.
Garanta que passam:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## Convenções

- Nomes de arquivo em kebab-case; um componente/feature por arquivo.
- Testes ao lado do código (`*.test.ts[x]`); E2E em `tests/e2e/`.
- Imports absolutos com o alias `@/*`.
