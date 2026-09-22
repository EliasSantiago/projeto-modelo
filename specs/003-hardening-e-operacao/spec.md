# Especificação, Endurecimento e Operação (Feature 003)

- **ID:** 003-hardening-e-operacao
- **Status:** Em revisão
- **Data:** 2026-09-22
- **Constituição aplicável:** [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

> **Nota de processo, registrada de propósito:** estes artefatos foram escritos
> **depois** da implementação, invertendo a ordem que o `AGENTS.md` torna
> obrigatória. A inversão foi apontada em revisão do PR #21, não percebida por
> quem implementou. Fica registrada aqui em vez de corrigida em silêncio: a
> spec retroativa restaura a rastreabilidade, mas não o efeito que a ordem
> existe para produzir, que é decidir **o quê** antes de escolher **como**.
> Esta spec descreve o que foi construído; quem revisa deve lê-la como
> proposta sujeita a mudança, não como registro de algo já aprovado.

---

## 1. Resumo Executivo

O projeto modelo nasceu com os controles de segurança do Princípio III no
lugar, mas com três classes de lacuna que não aparecem em uso normal: falha
que só se manifesta em produção, falha que ninguém consegue diagnosticar
depois de acontecer, e falha que a pessoa na frente da tela não consegue
contornar.

Nenhuma delas quebra uma tela, e é por isso que sobreviveram. Num projeto
**modelo** isso pesa mais que em um produto: todo projeto derivado herda a
lacuna junto com o resto, e herda também a impressão de que aquilo foi
revisado.

Esta feature fecha as três. Para quem adota o template, o que muda é: um erro
de configuração aparece no boot em vez de na primeira requisição real; um erro
de produção deixa rastro correlacionável em vez de sumir; e uma falha
inesperada mostra uma tela que explica o que fazer em vez da tela padrão do
framework.

## 2. Objetivos

- **O1**, resposta de autenticação indistinguível em conteúdo **e em tempo**,
  fechando o canal lateral que sobrava depois do anti-enumeração de conteúdo.
- **O2**, erro de servidor sempre observável: registrado com rota e tipo, e
  correlacionável com o que a pessoa viu na tela.
- **O3**, erro de configuração de ambiente detectado no boot, não em produção.
- **O4**, toda falha de render com tela própria, em qualquer nível, inclusive
  quando o que quebrou foi o layout raiz.
- **O5**, aplicação navegável por teclado desde o primeiro `Tab`.
- **O6**, estado do processo verificável de fora sem custo para o banco.

## 3. Fora de Escopo

- **CSP sem `'unsafe-inline'`.** Continua exigindo nonce por requisição, que
  custaria o prerender da aplicação inteira. Trade-off já registrado.
- **Impor e-mail confirmado para entrar.** Segue decisão de quem adota.
- **Revogação imediata de papel ou de confirmação de e-mail.** Ambos seguem
  em cache no token de sessão até o próximo login.
- **Check de prontidão profundo** (o que verifica banco e cache). O objetivo
  O6 cobre só o estado do processo; check profundo é outra feature, com
  autenticação própria.
- **Integração com serviço de observabilidade.** Esta feature entrega o ponto
  de plugagem, não a integração: obrigar conta em serviço de terceiro para
  rodar o template contraria o propósito dele.

## 4. Personas

- **Quem adota o template**, quer herdar uma base onde o erro de configuração
  aparece antes do deploy, não depois.
- **Quem opera em produção**, quer diagnosticar um incidente a partir do
  código que a pessoa reportou, sem pedir para ela reproduzir.
- **Quem navega por teclado ou leitor de tela**, quer alcançar o conteúdo sem
  atravessar a navegação inteira em cada página.
- **Quem ataca**, é a persona adversária: quer descobrir quais endereços têm
  conta aqui, e mede o que a aplicação não igualou.

## 5. Requisitos Funcionais

| #     | Requisito                                                                   | Critério de Aceite                                                                                                          |
| ----- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| RF-01 | Tentativa de entrar custa o mesmo para endereço com e sem conta             | A verificação de senha é exercitada nos três casos (sem conta, conta sem senha própria, senha errada), comprovado por teste |
| RF-02 | Cadastro simultâneo do mesmo endereço resulta na mesma recusa do caso comum | Duas criações concorrentes: a segunda recebe "e-mail já cadastrado", não erro genérico                                      |
| RF-03 | Consumo de link de uso único é limitado por origem                          | Repetir o envio além da cota devolve recusa sem consultar o link                                                            |
| RF-04 | Erro não tratado de requisição é registrado no servidor                     | Log carrega rota, método e tipo de render; não carrega cabeçalho nem corpo                                                  |
| RF-05 | Falha de render mostra tela própria em qualquer nível                       | Falha no conteúdo, na rota e no layout raiz, cada uma com sua tela; nenhuma exibe a mensagem interna do erro                |
| RF-06 | A pessoa recebe um código que identifica o erro dela                        | A tela de falha mostra o código, e o mesmo código aparece no log do servidor                                                |
| RF-07 | Ambiente sem host confiável avisa no boot                                   | Subir em produção sem URL canônica nem sinal de plataforma registra aviso explicando a consequência                         |
| RF-08 | Estado do processo é consultável de fora                                    | Endpoint público responde sem consultar dependência interna, e a resposta não é cacheável                                   |
| RF-09 | Primeiro `Tab` leva ao conteúdo                                             | Em qualquer página, o primeiro elemento focável é o atalho para o conteúdo; ele é invisível até receber foco                |
| RF-10 | Mutação de dado por-usuário não invalida conteúdo compartilhado             | Criar, concluir ou remover um item atualiza a lista de quem agiu sem descartar o conteúdo prerenderizado da rota            |

## 6. Requisitos Não-Funcionais

| #      | Categoria       | Requisito                                                                                                               |
| ------ | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| RNF-01 | Segurança       | Nenhuma resposta ao cliente carrega mensagem interna de erro; só o código de correlação                                 |
| RNF-02 | Performance     | O gate de rota só é avaliado em caminho que pode virar rota protegida, nunca em asset ou metadado                       |
| RNF-03 | Observabilidade | O ponto de captura de erro é único e não obriga dependência externa para funcionar                                      |
| RNF-04 | Disponibilidade | Consulta de estado do processo não pode falhar por indisponibilidade de banco ou cache, nem amplificar carga sobre eles |
| RNF-05 | Acessibilidade  | Atalho para o conteúdo conforme WCAG 2.4.1, presente em todos os layouts                                                |
| RNF-06 | Manutenção      | Nome de cookie de sessão declarado num lugar só, consumido pelo gate de rota e pela configuração de sessão              |
| RNF-07 | Qualidade       | Cobertura medida sobre a lógica de domínio; camada de apresentação fica de fora, coberta por fluxo ponta-a-ponta        |
| RNF-08 | Segurança       | Advisory de severidade alta ou crítica em dependência falha o gate automatizado                                         |

## 7. Modelo de Domínio

Nenhuma entidade nova. Esta feature endurece caminhos e adiciona superfície de
operação; não muda o que o sistema guarda nem as relações entre os dados.

## 8. Requisitos de Segurança (rastreáveis)

Numeração continua de SEC-19 (última usada na feature 002).

| #      | Controle                                                             | Verificação                                                                                                                   |
| ------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| SEC-20 | Resposta de autenticação indistinguível **em tempo**                 | A verificação de senha roda também sem conta e sem senha cadastrada; teste confirma que ela é sempre exercitada uma vez       |
| SEC-21 | Consumo de link de uso único limitado por origem                     | Além da cota, a recusa vem antes de qualquer consulta ao link                                                                 |
| SEC-22 | Contexto de navegação isolado de terceiros                           | Cabeçalho de isolamento presente em toda resposta; aplicação não é embutível nem manipulável por aba que a abriu              |
| SEC-23 | Host confiável exigido em produção                                   | Sem URL canônica nem sinal de plataforma, o boot avisa; o framework de auth recusa o cabeçalho de host em vez de confiar nele |
| SEC-24 | Erro de servidor observável sem vazar para o cliente                 | Detalhe fica no log; a tela mostra apenas o código de correlação, em produção e em desenvolvimento igualmente                 |
| SEC-25 | Unicidade de endereço garantida pelo banco, não pela checagem prévia | Violação da restrição do banco é traduzida na mesma recusa do caminho comum, comprovado por teste                             |
| SEC-26 | Consulta pública de estado não alcança dependência interna           | O endpoint responde sem tocar banco ou cache, e não pode ser servido de cache intermediário                                   |
| SEC-27 | Advisory alto ou crítico em dependência bloqueia a entrega           | Gate automatizado falha; correção de dependência transitiva fixa a menor versão corrigida do mesmo major                      |

## 9. Critérios de Aceite Globais (Definition of Done)

1. `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build` passam.
2. Todo RF e SEC verificável manualmente ou por teste automatizado.
3. Nenhuma violação da constituição.
4. Os controles de infraestrutura (cabeçalhos, consulta de estado, atalho de
   teclado) têm teste ponta-a-ponta: são os que desaparecem num refactor sem
   quebrar nenhuma tela.
5. O invólucro por onde passa toda mutação autenticada tem teste próprio,
   inclusive da **ordem** em que ele checa autenticação, papel e entrada.

## 10. Perguntas em Aberto / Suposições

- **[EM ABERTO]** Aviso de host não confiável deveria falhar o boot em vez de
  avisar? Falhar é mais seguro e quebra o build fora de plataforma conhecida,
  onde o host de produção ainda não existe. Ficou como aviso; a decisão é de
  quem adota.
- **[EM ABERTO]** O gate de auditoria deveria falhar também em severidade
  moderada? Hoje ignora, para não travar merge por ruído em dependência de
  desenvolvimento.
- **[SUPOSIÇÃO]** O fluxo de login social usa redirecionamento de página
  inteira, não janela auxiliar. É o que permite isolar o contexto de navegação
  (SEC-22) sem quebrar o login. Se algum provedor passar a exigir janela
  auxiliar, o cabeçalho precisa ser revisto para aquela rota.
- **[SUPOSIÇÃO]** Quem opera coleta log de saída padrão do processo. Se o
  destino for outro, o ponto de captura único é onde se liga o envio.
- **[SUPOSIÇÃO]** Confirmação de e-mail e papel seguem em cache no token de
  sessão. Esta feature não muda isso; se alguma rota passar a exigir e-mail
  confirmado, a renovação de sessão vira requisito.
