---
description: Inicia uma feature nova seguindo o fluxo SDD (spec → plan → tasks)
argument-hint: <nome-da-feature em kebab-case>
allowed-tools: Bash(ls:*), Bash(cp:*), Bash(mkdir:*), Read, Write, Edit
---

Inicie uma nova feature deste projeto seguindo Spec-Driven Development.

Nome informado: **$1**

## Passo 1, descobrir o próximo número

Liste `specs/` e determine o próximo ID sequencial de três dígitos
(`001`, `002`, …), ignorando a pasta `_template`.

## Passo 2, criar a pasta a partir do template

Copie `specs/_template/` para `specs/<NNN>-$1/`.

## Passo 3, preencher a spec (e SÓ a spec)

Abra `specs/<NNN>-$1/spec.md` e preencha com base no que o usuário pedir.

Regras inegociáveis desta etapa:

- **Nada de stack.** Sem biblioteca, sem tabela, sem assinatura de função.
  Se algo só faz sentido para quem conhece a stack, guarde para o `plan.md`.
- Todo requisito funcional precisa de critério de aceite **verificável**.
- Numere os controles SEC continuando a partir do último já usado no projeto
  (confira `specs/001-projeto-modelo/spec.md`).
- Se faltar informação para decidir algo, registre em "Perguntas em Aberto"
  em vez de inventar. **Pergunte ao usuário** o que for bloqueante.

## Passo 4, parar e confirmar

Mostre um resumo da spec e **pare**. Não escreva `plan.md`, não escreva
`tasks.md`, não crie nenhum arquivo em `src/`.

A ordem `constitution → spec → plan → tasks → implementação` é obrigatória
(veja `CLAUDE.md` e `.specify/memory/constitution.md`). Cada etapa depende da
anterior estar aprovada pelo usuário — pular etapa é o erro que este fluxo
existe para evitar.

Peça revisão da spec. Só depois do "ok" siga para o `plan.md`, e só depois de
aprovado o plano siga para o `tasks.md`.
