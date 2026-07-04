# Constituição — Projeto Modelo Next.js

> Documento de governança do SDD (Spec-Driven Development). Define os princípios
> **inegociáveis**. Qualquer `spec.md`, `plan.md` ou `tasks.md` que os viole deve
> ser corrigido antes da implementação. A ordem de trabalho é sempre:
> **constitution → spec → plan → tasks → implementação**.

Versão: 1.0.0 · Ratificada: 2026-07-04

---

## Princípio I — Server-First e App Router

- App Router é a única forma de roteamento. **Proibido** `pages/` e
  `react-router-dom`.
- React Server Components são o padrão. `'use client'` só entra onde há
  interatividade real (estado, efeitos, eventos do browser).
- Mutações usam **Server Actions**; leituras ficam em Server Components.
  Route Handlers (`route.ts`) apenas para webhooks/APIs públicas.
- Estado: prioridade para Server Components → Server Actions → URL State.
  Zustand só quando estado de cliente global for inevitável.

## Princípio II — Type-Safety Total

- TypeScript em **strict mode**, sem exceção. `any` implícito é erro.
- Toda fronteira de dados (form, Server Action, env, params de rota) é
  validada com **Zod** antes de ser usada. Nunca confiar em dados do cliente.
- Tipos derivam do schema (`z.infer`) — schema é a fonte da verdade.

## Princípio III — Segurança por Padrão (Secure by Default) — OBRIGATÓRIO

- Secrets nunca são expostos. Só `NEXT_PUBLIC_*` chega ao cliente.
- Banco de dados é acessado **exclusivamente** no servidor.
- Consultas sempre parametrizadas (via Drizzle) — mitigar SQL Injection.
- Output sempre escapado pelo React — mitigar XSS; nunca
  `dangerouslySetInnerHTML` com dado não sanitizado.
- Toda Server Action e rota privada verifica sessão/autorização antes de agir.
- Cookies de sessão: `HttpOnly`, `Secure`, `SameSite`.
- Erros nunca vazam stack trace, SQL ou secret para o cliente.
- Referência viva: **OWASP Top 10**.

## Princípio IV — Camadas e Separação de Responsabilidades

Dependências fluem numa direção só:

```
app / components  →  features / hooks  →  actions
actions  →  services  →  repositories  →  db
schemas, types, lib, utils, constants: transversais (sem dependência de UI)
```

- `repositories/` é a **única** camada que fala com o Drizzle. Nenhuma query
  SQL fora dela.
- `actions/` valida entrada (Zod) + autoriza + orquestra `services`.
- `components/ui` (ShadCN) é puramente apresentacional e reutilizável.

## Princípio V — Qualidade Automatizada como Gate

- ESLint + Prettier + TypeScript devem passar limpos antes de qualquer commit.
- Husky + lint-staged aplicam isso no `pre-commit`. Verde não é opcional.
- Toda unidade de lógica (schema, service, util) merece teste. Fluxos
  críticos (auth, mutações) têm teste E2E em Playwright.

## Princípio VI — Performance como Requisito, não Enfeite

- Streaming + Suspense para conteúdo dinâmico; Cache Components/`use cache`
  para dados estáveis.
- `next/image` e `next/font` são obrigatórios (nada de `<img>`/`<link>` de fonte).
- Dynamic imports + lazy loading para peso de cliente não crítico.

## Princípio VII — Bibliotecas Modernas e Justificadas

- Sempre a última versão **estável** de cada dependência.
- Nada de dependência obsoleta ou abandonada. Toda escolha técnica relevante
  é justificada em `plan.md` (seção "Decisões Arquiteturais").

---

## Processo de Emenda

Alterar este documento exige: (1) justificativa registrada, (2) incremento de
versão semântica, (3) revisão dos `plan.md` afetados. Guidance específico de
implementação vive no `AGENTS.md`/`CLAUDE.md`, não aqui.
