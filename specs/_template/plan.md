# Plano Técnico, <NOME DA FEATURE> (Feature <NNN>)

- **Spec:** [spec.md](./spec.md)
- **Data:** <AAAA-MM-DD>
- **Constituição aplicável:** [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

> **Regra desta etapa:** aqui se descreve **como**, e cada escolha relevante
> vem com justificativa (Princípio VII). Um plano que só lista tecnologias
> sem dizer por que elas ganharam não passa na revisão.

---

## 1. Stack (apenas o que esta feature acrescenta)

| Área | Escolha | Versão | Por quê |
| ---- | ------- | ------ | ------- |
|      |         |        |         |

> Nada a acrescentar é uma resposta ótima: significa que a feature cabe na
> base existente. Escreva "nenhuma dependência nova" e siga.

## 2. Estrutura de Arquivos

```
src/
├── <camada>/<arquivo>.ts     # <responsabilidade>
```

Confira contra o Princípio IV antes de seguir. Dependências fluem num sentido só:

```
app / components  →  features / hooks  →  actions
actions  →  services  →  repositories  →  db
```

## 3. Decisões Arquiteturais (justificadas)

### D1, <decisão>

- **Contexto:** <o que forçou a escolha>
- **Alternativas:** <o que mais foi considerado>
- **Escolha:** <o que ficou, e por quê>
- **Custo aceito:** <o que se perde com isso>

> "Custo aceito" não é opcional. Decisão sem trade-off explícito costuma ser
> decisão não tomada.

## 4. Fronteiras de Segurança (mapa → SEC-xx)

| Fronteira | Mecanismo | SEC |
| --------- | --------- | --- |
|           |           |     |

## 5. Estratégia de Dados / Cache

- **Leitura:** <Server Component? `use cache`? qual `cacheLife`?>
- **Escrita:** <Server Action + revalidação de quê?>
- **Dado de request** (cookies/headers/`auth()`): precisa estar sob
  `<Suspense>`, senão bloqueia o prerender da rota (Cache Components).

## 6. Estratégia de Testes

| Camada        | O que testar | Ferramenta            |
| ------------- | ------------ | --------------------- |
| schema        |              | Vitest                |
| service       |              | Vitest (repo mockado) |
| componente    |              | Testing Library       |
| fluxo crítico |              | Playwright            |

## 7. Migrações / Rollout

- <mudança de schema? é retrocompatível? precisa de backfill?>
- <como reverter se der errado em produção>

## 8. Riscos & Mitigações

| Risco | Impacto | Mitigação |
| ----- | ------- | --------- |
|       |         |           |
