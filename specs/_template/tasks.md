# Tarefas, <NOME DA FEATURE> (Feature <NNN>)

- **Referência:** [plan.md](./plan.md) · [spec.md](./spec.md)
- Ordem por dependência. `[P]` = paralelizável. Marque `[x]` ao concluir.

> **Regra desta etapa:** cada tarefa cita o arquivo que toca e o RF/SEC que
> atende. Tarefa sem rastro ("ajustar o service") não é tarefa, é lembrete.
> Se uma tarefa não couber numa sessão de trabalho, quebre em duas.

---

## Fase 0, Fundação

- [ ] T001 <arquivo> — <o que fazer> (RF-01)

## Fase 1, Dados

- [ ] T010 `src/db/schema.ts` — <tabela/coluna> (SEC-NN)
- [ ] T011 `pnpm db:generate` e revisar o SQL gerado antes de commitar
- [ ] T012 `src/repositories/<x>.repository.ts` — única camada com Drizzle

## Fase 2, Domínio

- [ ] T020 `src/schemas/<x>.schema.ts` — Zod como fonte da verdade dos tipos
- [ ] T021 `src/services/<x>.service.ts` — regra de negócio, sem HTTP nem UI
- [ ] T022 `src/actions/<x>.actions.ts` — `authAction`/`adminAction`, só orquestra

## Fase 3, Interface

- [ ] T030 `src/features/<x>/<componente>.tsx` — Server Component por padrão
- [ ] T031 `'use client'` apenas nas ilhas com interação real
- [ ] T032 Estados de loading (`<Suspense>`) e erro (`error.tsx`)

## Fase 4, Testes

- [ ] T040 Testes de schema e service [P]
- [ ] T041 Teste de componente do caminho feliz e do erro [P]
- [ ] T042 E2E do fluxo crítico (se a feature tiver um)

## Fase 5, Fechamento

- [ ] T050 `pnpm typecheck && pnpm lint && pnpm test && pnpm build` verdes
- [ ] T051 README/`.env.example` atualizados, se a feature mudou configuração
- [ ] T052 Novos controles registrados na tabela SEC da `spec.md`
