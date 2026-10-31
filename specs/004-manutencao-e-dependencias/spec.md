# Especificação, Manutenção de Dependências e Endurecimento (Feature 004)

- **ID:** 004-manutencao-e-dependencias
- **Status:** Em revisão
- **Data:** 2026-10-31
- **Constituição aplicável:** [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

> **Nota de processo, registrada de propósito:** como na feature 003, estes
> artefatos foram escritos **depois** da implementação. Desta vez a inversão
> foi pedida: a instrução foi atualizar tudo, corrigir o que houvesse de
> segurança e publicar direto na `main`, sem parada entre etapas. A spec
> retroativa restaura a rastreabilidade, não a revisão prévia que a ordem
> existe para garantir. Quem revisa deve lê-la como proposta sujeita a
> mudança, não como registro de algo já aprovado.

---

## 1. Resumo Executivo

O framework e várias bibliotecas do projeto modelo acumularam vulnerabilidades
publicadas, entre elas três críticas de execução remota de código sem
autenticação. Num template isso pesa em dobro: todo projeto derivado nasce
com a falha e com a impressão de que ela foi revisada.

Ao atualizar, a revisão encontrou também falhas que nenhuma atualização
corrigiria: um filtro de rotas que o framework nunca leu, um limite de senha
medido na unidade errada, um link de uso único que podia ser usado duas vezes
sob concorrência, e correções antigas de dependência que passaram a rebaixar
versões em vez de corrigi-las.

Para quem adota o template, o que muda é: nenhum advisory alto ou crítico
conhecido, a senha escolhida vale por inteiro, e os controles que a
documentação descreve passam a funcionar como descritos.

## 2. Objetivos

- **O1**, nenhum advisory alto ou crítico conhecido em dependência, e os
  moderados restantes justificados por escrito.
- **O2**, toda dependência na versão mais recente compatível com o resto do
  ferramental; onde não for possível, o motivo registrado.
- **O3**, os controles que a documentação descreve funcionam como descritos.

## 3. Fora de Escopo

- Revogar sessões ativas quando a senha é redefinida. Exige leitura por
  requisição ou versão de sessão, uma mudança de arquitetura que merece spec
  própria (ver seção 10).
- Limite de tentativas de login por conta, independente da origem. Muda a
  troca entre força bruta distribuída e bloqueio de conta alheia; idem.
- Retornar ao destino original depois do login. É comportamento novo.
- Trocar de major o gerenciador de pacotes.

## 4. Personas

- **Quem adota o template**, quer começar um projeto sem herdar falha
  conhecida.
- **Quem mantém o template**, quer que o gate de dependências continue
  significando algo e que correção antiga não vire pin invisível.
- **Usuário final**, quer que a senha que escolheu seja a senha verificada.

## 5. Requisitos Funcionais

| #     | Requisito                                                       | Critério de Aceite                                                                                   |
| ----- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| RF-01 | Dependências atualizadas                                        | Auditoria sem alto/crítico; cada dependência no topo compatível, exceções explicadas no plano        |
| RF-02 | O gate barato de rota roda só onde pode haver rota protegida    | Requisição de recurso estático não passa pelo gate                                                   |
| RF-03 | Navegação prefetcha o que não depende da sessão                 | Build sem aviso de configuração pendente; nenhuma rota perde a pré-renderização parcial que já tinha |
| RF-04 | Conteúdo dependente de sessão continua correto após a navegação | Nenhum erro de pré-renderização no servidor durante o fluxo ponta-a-ponta                            |
| RF-05 | Senha longa demais é recusada com mensagem clara                | Senha acima do limite real do verificador é rejeitada no cadastro e na redefinição; login não muda   |

## 6. Requisitos Não-Funcionais

| #      | Categoria  | Requisito                                                                                     |
| ------ | ---------- | --------------------------------------------------------------------------------------------- |
| RNF-01 | Segurança  | Correção de dependência transitiva nunca muda o major que o pacote dependente pediu           |
| RNF-02 | Segurança  | Correção de dependência transitiva sai quando o pacote dependente já exige a versão corrigida |
| RNF-03 | Segurança  | O pipeline de integração opera com o menor privilégio que precisa                             |
| RNF-04 | Manutenção | Versão mínima de runtime declarada bate com o que o ferramental exige                         |

## 7. Modelo de Domínio

Nenhuma entidade nova e nenhuma coluna nova.

## 8. Requisitos de Segurança (rastreáveis)

Numeração continua de SEC-27 (última usada na feature 003).

| #      | Controle                                                                              | Verificação                                                                                  |
| ------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| SEC-28 | Senha limitada ao que o verificador de fato lê                                        | Teste prova a colisão que o limite evita e que o schema recusa a senha que a causaria        |
| SEC-29 | Link de uso único consumido de forma atômica                                          | Consumo e checagem de validade numa única operação; teste confirma o consumo antes do efeito |
| SEC-30 | Ação pública valida também os argumentos fixados pela interface                       | Provedor social desconhecido ou não configurado é recusado antes de chegar ao fluxo de auth  |
| SEC-31 | Origem da requisição lida primeiro do cabeçalho escrito pelo proxy                    | Teste: trocar o cabeçalho que o cliente controla não gera cota nova                          |
| SEC-32 | Pipeline de integração com privilégio mínimo e sem credencial persistida em disco     | Inspeção do workflow                                                                         |
| SEC-33 | Produção recusa segredo de sessão fraco ou de exemplo; dados demo sem senha conhecida | Teste do schema de ambiente; build com o segredo de exemplo falha; seed recusa produção      |

## 9. Critérios de Aceite Globais (Definition of Done)

1. `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build` passam.
2. E2E passa contra o build de produção, sem erro no log do servidor.
3. `pnpm audit --audit-level high` passa.
4. Nenhuma violação da constituição; nenhuma camada nova.

## 10. Perguntas em Aberto / Suposições

- **[EM ABERTO]** Redefinir a senha deveria derrubar as sessões ativas? Hoje
  não derruba: a sessão vive num token assinado e só expira no prazo. Para
  quem redefine a senha porque a conta foi tomada, é a expectativa natural.
  Proposta para uma feature própria.
- **[EM ABERTO]** Login deveria ter também um limite por conta, além do por
  origem + conta? Fecha a força bruta distribuída por muitas origens, ao custo
  de permitir que um atacante trave a conta alheia.
- **[EM ABERTO]** O destino original (`callbackUrl`) é anotado pelo gate de
  rota mas ignorado pelo login, que sempre leva ao painel.
- **[SUPOSIÇÃO]** Os dois advisories moderados restantes estão em ferramenta
  de desenvolvimento e no recurso que este projeto não usa (ver plano, D5).
  Se algum deles subir de severidade, o gate de auditoria avisa.
