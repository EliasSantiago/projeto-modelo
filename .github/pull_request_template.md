## O que muda

<!-- Uma frase. O "por quê" vem abaixo. -->

## Por quê

<!-- Que problema isso resolve. Se houver issue ou spec, linke:
     Spec: specs/<NNN>-<nome>/spec.md -->

## Tipo

- [ ] Correção de bug
- [ ] Feature (passou pelo fluxo SDD: spec → plan → tasks)
- [ ] Refatoração sem mudança de comportamento
- [ ] Documentação
- [ ] Infra / ferramental

## Gate

- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` passam
- [ ] `pnpm test:e2e` passa (se tocou em fluxo crítico)
- [ ] Testes cobrindo o comportamento novo ou o bug corrigido

## Arquitetura

- [ ] Query Drizzle só em `repositories/`
- [ ] Regra de negócio em `services/`; `actions/` apenas orquestra
- [ ] `'use client'` só onde há interação real
- [ ] Dado de request (`cookies`/`headers`/`auth()`) sob `<Suspense>`

## Segurança

- [ ] Server Action nova passa por `authAction`/`adminAction`
- [ ] Entrada validada com Zod antes de qualquer efeito
- [ ] Autorização por posse do recurso (ou papel, via `requireRole`)
- [ ] Erro devolvido ao cliente não vaza detalhe interno
- [ ] Secret novo só em `env.server.ts`, documentado no `.env.example`
- [ ] Controle de segurança novo registrado na tabela SEC da spec

## Banco

- [ ] Migration gerada (`pnpm db:generate`), **SQL revisado** e versionada
- [ ] Mudança é retrocompatível, ou o plano de rollout está descrito abaixo

## Notas para quem revisa

<!-- Trade-off assumido, o que ficou de fora de propósito, o que merece
     atenção especial. -->
