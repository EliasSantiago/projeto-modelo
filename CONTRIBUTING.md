# Contribuindo

Obrigado pelo interesse. Este projeto segue **Spec-Driven Development**: a
decisão vem antes do código, e fica escrita.

> Para o guia completo de arquitetura e convenções, leia
> [`AGENTS.md`](./AGENTS.md) (o mesmo arquivo apontado por `CLAUDE.md`).
> Ele vale para humanos e para agentes de IA.

## Antes de abrir PR

### 1. Correção pequena (bug, typo, ajuste de doc)

Vá direto ao código. Não precisa de spec.

### 2. Feature ou mudança de comportamento

Passe pelo fluxo SDD **antes** de implementar:

```
constitution → spec → plan → tasks → implementação
```

```bash
# Com Claude Code:
/nova-feature <nome-em-kebab-case>

# Manualmente:
cp -r specs/_template specs/<NNN>-<nome>
```

Cada etapa depende da anterior estar aprovada. PR que chega com código sem
spec vai ser pedido de volta — não por burocracia, mas porque revisar decisão
depois de implementada custa muito mais caro.

## Regras que o revisor vai conferir

Estão na [constituição](./.specify/memory/constitution.md). As que mais
reprovam PR:

- **Camadas** (Princípio IV). Query Drizzle só em `repositories/`. Regra de
  negócio só em `services/`. `actions/` apenas orquestra.
- **Segurança** (Princípio III). Toda Server Action passa por
  `authAction`/`adminAction`. Autorização por posse do recurso. Erro sem
  detalhe sensível ao cliente.
- **Type-safety** (Princípio II). Schema Zod é a fonte da verdade; tipos
  derivam com `z.infer`. Sem `any`.
- **Server-first** (Princípio I). `'use client'` só em ilha com interação
  real. Dado de request (`cookies`/`headers`/`auth()`) sob `<Suspense>`.

## Gate local

O hook de `pre-commit` (Husky + lint-staged) roda ESLint + Prettier. Antes de
abrir o PR, garanta o gate completo:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Fluxo crítico (auth, mutação, autorização) precisa também de E2E:

```bash
pnpm test:e2e
```

## Mudou o schema do banco?

```bash
pnpm db:generate    # gera o SQL
```

**Revise o SQL gerado antes de commitar** e versione a migration junto do
código. A pasta `drizzle/`, incluindo `meta/`, é versionada de propósito:
sem o journal, a próxima migration sai errada.

## Convenções

- Arquivos em kebab-case; um componente/feature por arquivo.
- Testes ao lado do código (`*.test.ts[x]`); E2E em `tests/e2e/`.
- Imports absolutos com o alias `@/*`.
- Commits descrevem **por que**, não só o quê.

## Segurança

Achou vulnerabilidade? **Não abra issue.** Siga o
[`SECURITY.md`](./SECURITY.md).
