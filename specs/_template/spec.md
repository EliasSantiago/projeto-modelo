# Especificação, <NOME DA FEATURE> (Feature <NNN>)

- **ID:** <NNN>-<slug-da-feature>
- **Status:** Rascunho | Em revisão | Aprovada
- **Data:** <AAAA-MM-DD>
- **Constituição aplicável:** [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

> **Regra desta etapa:** aqui se descreve **o quê** e **por quê**, nunca _como_.
> Sem nome de biblioteca, sem nome de tabela, sem assinatura de função. Se um
> parágrafo só faz sentido para quem conhece a stack, ele pertence ao `plan.md`.

---

## 1. Resumo Executivo

<Dois ou três parágrafos: que problema isso resolve, para quem, e o que muda
para essa pessoa quando estiver pronto.>

## 2. Objetivos

- **O1**, <resultado observável, não tarefa>
- **O2**, ...

## 3. Fora de Escopo

<O que esta feature deliberadamente NÃO faz. Esta seção evita retrabalho:
o que estiver aqui não volta como bug depois.>

## 4. Personas

- **<Persona>**, <o que ela quer, em uma frase>

## 5. Requisitos Funcionais

| #     | Requisito   | Critério de Aceite                 |
| ----- | ----------- | ---------------------------------- |
| RF-01 | <requisito> | <como se verifica que está pronto> |

> Critério de aceite ruim: "funciona bem". Bom: "usuário sem sessão que abre
> /x é levado a /login com callbackUrl preservada".

## 6. Requisitos Não-Funcionais

| #      | Categoria   | Requisito   |
| ------ | ----------- | ----------- |
| RNF-01 | Segurança   | <requisito> |
| RNF-02 | Performance | <requisito> |

## 7. Modelo de Domínio

<Entidades e relações em linguagem de negócio. "Um pedido pertence a um
cliente e tem muitos itens", não `orders.customer_id`.>

## 8. Requisitos de Segurança (rastreáveis)

> Numere a partir do último SEC usado no projeto (veja `specs/001-projeto-modelo/spec.md`).
> Todo controle aqui precisa ser verificável, por teste ou por inspeção.

| #      | Controle   | Verificação        |
| ------ | ---------- | ------------------ |
| SEC-NN | <controle> | <como se comprova> |

## 9. Critérios de Aceite Globais (Definition of Done)

1. `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build` passam.
2. Todo RF e SEC verificável manualmente ou por teste automatizado.
3. Nenhuma violação da constituição.
4. <critério específico desta feature>

## 10. Perguntas em Aberto / Suposições

- **[EM ABERTO]** <pergunta que precisa de resposta antes do plan>
- **[SUPOSIÇÃO]** <o que se assumiu para poder seguir, e o que muda se estiver errado>

> Não apague esta seção por estar vazia: "nenhuma pergunta em aberto" é
> informação, e obriga a olhar de novo antes de aprovar.
