# Guia de Contribuição (humanos e agentes de IA)

Este projeto segue **Spec-Driven Development**. Leia antes de codar.

## Ordem de trabalho (obrigatória)

```
constitution → spec → plan → tasks → implementação
```

1. **Constituição**, princípios inegociáveis: `.specify/memory/constitution.md`.
2. **Spec** (`specs/<n>-<feature>/spec.md`), o quê e por quê. Sem stack.
3. **Plan** (`plan.md`), como. Decisões técnicas justificadas.
4. **Tasks** (`tasks.md`), passos rastreáveis, ordenados por dependência.
5. **Implementação**, só depois dos 4 acima.

Para uma nova feature, rode `/nova-feature <nome-em-kebab-case>`: ele numera a
pasta, copia `specs/_template/` e conduz a spec. Manualmente, copie
`specs/_template/` para `specs/<NNN>-<nome>/`. Use `specs/001-projeto-modelo`
como exemplo preenchido.

Cada etapa depende do "ok" do usuário na anterior. Pular etapa é o erro que
este fluxo existe para evitar.

## Regras de arquitetura (Princípio IV da constituição)

Dependências num sentido só:

```
app / components → features / hooks → actions → services → repositories → db
```

- **Nunca** faça query Drizzle fora de `repositories/`.
- **Nunca** coloque regra de negócio em `actions/`, orquestre `services/`.
- Toda Server Action passa por `authAction` (`lib/safe-action.ts`):
  autentica → valida (Zod) → autoriza → executa com erro seguro.
- Schema Zod é a fonte da verdade dos tipos (`z.infer`), reusado no cliente e
  no servidor.
- `'use client'` só em ilhas interativas. Padrão é Server Component.
- Dado de request (cookies/headers/`auth()`) que não é cacheado precisa estar
  dentro de `<Suspense>` (Cache Components / PPR).

## Cache (`lib/cache.ts`, guia em `docs/caching.md`)

- Código síncrono **já é estático** (prerenderizado no CDN). Não cacheie o que
  já é estático: só adiciona indireção.
- **Nunca** ponha dado por-usuário em `'use cache: remote'`. O Runtime Cache da
  Vercel é compartilhado entre visitantes: uma entrada por usuário derruba a
  taxa de acerto e um erro de chave vaza dado entre contas. Cacheie pela
  dimensão de poucos valores distintos (idioma, categoria), nunca pelo `userId`.
- Perfis de tempo em `CACHE_PROFILES` e tags em `cacheTags`, nunca literais
  espalhados: tag com typo não quebra o build, só deixa de invalidar.
- Invalide por tag (`updateTag` em Server Action) e não por `revalidatePath`,
  que derruba a rota inteira, inclusive o shell estático.

## Segurança (Princípio III, sempre)

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
