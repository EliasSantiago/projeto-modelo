# Especificação, Verificação de E-mail (Feature 002)

- **ID:** 002-verificacao-de-email
- **Status:** Aprovada
- **Data:** 2026-07-20
- **Constituição aplicável:** [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

---

## 1. Resumo Executivo

Hoje o cadastro aceita qualquer endereço de e-mail: ninguém comprova que
controla a caixa informada. Isso permite criar conta com o e-mail de outra
pessoa, e deixa o produto sem canal confiável para avisos importantes.

Esta feature fecha o ciclo: ao criar conta com senha, a pessoa recebe um link
de confirmação e só depois de clicá-lo o endereço é considerado verificado.
Quem entra por um provedor social já chega verificado, porque o provedor
comprovou o endereço antes de nós.

O envio de e-mail passa a ser feito por um provedor trocável, para que adotar
este projeto não obrigue ninguém a um fornecedor específico.

## 2. Objetivos

- **O1**, Nenhuma conta com senha é tratada como confiável sem que alguém
  tenha aberto a caixa de entrada daquele endereço.
- **O2**, Quem cria conta entende o que falta fazer e consegue pedir um novo
  link sem apoio de suporte.
- **O3**, Trocar de provedor de e-mail é mudança de configuração, não
  reescrita de código.

## 3. Fora de Escopo

- Bloquear login de conta não verificada (a decisão fica com quem adota o
  projeto; a ferramenta é entregue, a política não é imposta).
- Confirmar troca de endereço de e-mail de uma conta existente.
- Templates de e-mail em HTML elaborado ou editor visual de mensagem.
- Reenvio automático programado ou campanha de lembrete.

## 4. Personas

- **Pessoa que cria conta**, quer usar o produto e precisa entender em uma
  frase o que falta.
- **Pessoa que perdeu o e-mail**, apagou a mensagem e quer outro link sem
  abrir chamado.
- **Quem adota o template**, quer o próprio provedor de e-mail e a própria
  política de bloqueio.

## 5. Requisitos Funcionais

| #     | Requisito                                    | Critério de Aceite                                                                                     |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| RF-08 | Envio do link ao criar conta com senha       | Concluído o cadastro, um link de confirmação chega ao endereço informado                               |
| RF-09 | Confirmação por link                         | Abrir o link marca o endereço como verificado e informa o resultado                                    |
| RF-10 | Link de uso único e com validade             | O mesmo link não confirma duas vezes; após 24h ele deixa de valer e a pessoa é orientada a pedir outro |
| RF-11 | Pedido de novo link                          | Pessoa autenticada e não verificada consegue solicitar novo link e recebe confirmação visual do envio  |
| RF-12 | Conta social já nasce verificada             | Quem entra por provedor social não recebe pedido de confirmação                                        |
| RF-13 | Estado visível para quem já entrou           | A sessão carrega se o endereço está verificado, permitindo à interface reagir                          |
| RF-14 | Provedor de e-mail trocável por configuração | Alternar entre os provedores suportados não exige mudar código de aplicação                            |

## 6. Requisitos Não-Funcionais

| #      | Categoria       | Requisito                                                                                   |
| ------ | --------------- | ------------------------------------------------------------------------------------------- |
| RNF-09 | Segurança       | Cumprir os controles SEC desta spec                                                         |
| RNF-10 | Disponibilidade | Falha no envio não impede a criação da conta: a pessoa pede outro link depois               |
| RNF-11 | Portabilidade   | Provedor escolhido por variável de ambiente, sem dependência obrigatória em desenvolvimento |
| RNF-12 | Testabilidade   | Regras de token e seleção de provedor cobertas por teste automatizado                       |

## 7. Modelo de Domínio

- **Conta**, ganha a informação "endereço confirmado em <data>", vazia até a
  confirmação acontecer.
- **Convite de confirmação**, pertence a uma conta, tem prazo de validade e
  vale uma única vez. Uma conta tem no máximo um convite válido: pedir outro
  invalida o anterior.

## 8. Requisitos de Segurança (rastreáveis)

| #      | Controle                                         | Verificação                                                                    |
| ------ | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| SEC-14 | Convite guardado como hash, nunca em claro       | Quem lê o banco não consegue confirmar conta alheia                            |
| SEC-15 | Convite de uso único e com expiração             | Segundo uso do mesmo link falha; uso após o prazo falha                        |
| SEC-16 | Pedido de novo link limitado por origem          | Repetir o pedido além da cota devolve recusa, sem enviar mensagem              |
| SEC-17 | Pedido de novo link não revela contas            | Resposta idêntica exista ou não a conta, e independente de já estar verificada |
| SEC-18 | Confirmação vale só para a conta dona do convite | Convite de uma conta nunca verifica outra                                      |
| SEC-19 | Falha de envio não interrompe o cadastro         | Conta é criada mesmo com o provedor de e-mail fora do ar                       |

## 9. Critérios de Aceite Globais (Definition of Done)

1. `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build` passam.
2. Todo RF e SEC verificável manualmente ou por teste automatizado.
3. Nenhuma violação da constituição.
4. `.env.example`, README e SECURITY.md refletem a nova configuração.

## 10. Perguntas em Aberto / Suposições

- **[SUPOSIÇÃO]** Login de conta não verificada segue permitido. O bloqueio é
  entregue como ferramenta opcional; impor a política quebraria contas já
  existentes de quem atualizar o template.
- **[SUPOSIÇÃO]** Provedor social comprova o endereço antes de nós. Vale para
  Google e GitHub, que só expõem endereço já confirmado.
- **[SUPOSIÇÃO]** 24h de validade equilibra segurança e a chance de a pessoa
  só abrir o e-mail no dia seguinte.
