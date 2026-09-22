# Plano Técnico, Endurecimento e Operação (Feature 003)

- **Spec:** [spec.md](./spec.md)
- **Data:** 2026-09-22
- **Constituição aplicável:** [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

> Escrito retroativamente, junto da spec. Ver a nota de processo em
> [spec.md](./spec.md); as decisões abaixo foram tomadas durante a
> implementação, e este documento as registra em vez de as ter guiado.

---

## 1. Stack (apenas o que esta feature acrescenta)

| Área      | Escolha               | Versão   | Por quê                                                                                                                             |
| --------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Cobertura | `@vitest/coverage-v8` | `4.1.11` | Provider oficial do Vitest já em uso; o motor de cobertura é o do V8, sem instrumentar o código-fonte nem exigir segundo transpiler |

Nada além disso. O resto da feature usa API de primeira parte do framework
(`instrumentation.ts`, `refresh()`, `connection()`, boundaries de erro) e
código próprio. O ponto de plugagem de observabilidade fica vazio de propósito
(ver D4).

## 2. Estrutura de Arquivos

```
src/
├── instrumentation.ts                  # boot + captura única de erro de requisição
├── constants/auth.ts                   # nomes do cookie de sessão (gate + config)
├── app/
│   ├── error.tsx                       # falha de rota
│   ├── global-error.tsx                # falha do layout raiz (substitui <html>)
│   ├── unauthorized.tsx                # 401, par de forbidden.tsx
│   └── api/health/route.ts             # consulta de estado do processo
└── lib/
    ├── env.server.ts                   # + sinais de host confiável
    ├── rate-limit.ts                   # + balde de consumo de token
    └── safe-action.test.ts             # invólucro de mutação, antes sem teste
tests/e2e/hardening.spec.ts             # cabeçalhos, estado, atalho de teclado
```

Nenhum arquivo novo em `repositories/`, `services/` ou `actions/`: a feature
não acrescenta domínio. O Princípio IV segue respeitado — `instrumentation.ts`
e `constants/auth.ts` são transversais e não dependem de UI, e
`app/api/health/route.ts` não alcança camada nenhuma abaixo dele.

## 3. Decisões Arquiteturais (justificadas)

### D1, igualar o tempo com verificação descartável em vez de atraso artificial

- **Contexto:** a verificação de senha só rodava quando havia conta com senha.
  Os outros dois caminhos respondiam em microssegundos contra ~100 ms, e a
  diferença é medível de fora (SEC-20).
- **Alternativas:** (a) atraso fixo antes de responder; (b) atraso aleatório;
  (c) rodar a verificação sempre, contra um valor descartável.
- **Escolha:** (c). Atraso fixo precisa ser calibrado acima do pior caso real,
  então piora a resposta de todo mundo e ainda erra quando a máquina muda de
  carga. Atraso aleatório só adiciona ruído: com amostras suficientes, a média
  continua separando os casos.
- **Custo aceito:** gasta o custo da verificação em toda tentativa com
  endereço inexistente, que é justamente o que um ataque de força bruta
  produz em volume. É o mesmo custo que uma tentativa com senha errada já
  tinha, e o balde de limite de tentativas é quem contém o volume.

### D2, `refresh()` em vez de `revalidatePath()` na mutação por-usuário

- **Contexto:** a lista de itens é por-usuário e não é cacheada, mas a mutação
  invalidava a rota inteira por caminho (RF-10).
- **Alternativas:** (a) manter por caminho; (b) cachear a lista por usuário e
  invalidar por etiqueta; (c) `refresh()`.
- **Escolha:** (c). Não existe entrada de cache para invalidar, só a cópia que
  o cliente já baixou — que é exatamente o que `refresh()` atualiza. A (b)
  criaria uma entrada por usuário para um dado que muda a cada ação e já
  resolve em consulta indexada: custo e risco sem ganho, e é o que
  `lib/cache.ts` proíbe.
- **Custo aceito:** `refresh()` é API recente do framework; se ela mudar de
  forma, este é o ponto a revisar. Em troca, o conteúdo prerenderizado da rota
  para de ser descartado a cada item marcado como concluído.

### D3, avisar sobre host não confiável em vez de falhar o boot

- **Contexto:** sem URL canônica em produção, o framework de auth recusa o
  cabeçalho de host e **toda** verificação de sessão falha (SEC-23). Erro que
  aparece só depois do deploy e cuja causa não é óbvia.
- **Alternativas:** (a) exigir a variável no schema de ambiente; (b) avisar no
  boot; (c) deixar como está e documentar.
- **Escolha:** (b). A (a) quebraria o build fora de plataforma conhecida, onde
  o host de produção ainda nem existe — inclusive no próprio CI. A (c) já era
  o estado, e foi assim que a lacuna passou.
- **Custo aceito:** aviso pode ser ignorado. Mitigado por vir no boot (não
  perdido no meio do tráfego) e por descrever a consequência, não só a
  variável faltando. A verificação espelha a regra da biblioteca, então precisa
  ser reconferida quando ela subir de versão — foi reconferida na 0.41.3.

### D4, ponto de captura único e vazio, em vez de integração pronta

- **Contexto:** erro de servidor precisava de captura central (SEC-24, RF-04).
- **Alternativas:** (a) `try/catch` espalhado; (b) integrar um serviço de
  observabilidade; (c) usar o gancho de instrumentação do framework e deixar o
  envio como ponto de plugagem.
- **Escolha:** (c). A (a) não cobre erro de render. A (b) obrigaria quem só
  quer rodar o template a criar conta em serviço de terceiro.
- **Custo aceito:** sem integração, o log fica na saída padrão e depende de
  quem opera coletá-la. É o mínimo que funciona em qualquer destino.

### D5, consulta de estado rasa, sem alcançar banco nem cache

- **Contexto:** faltava forma de verificar o processo de fora (RF-08, SEC-26).
- **Alternativas:** (a) verificar banco e cache e reportar cada um; (b) só o
  processo.
- **Escolha:** (b). Endpoint público que dispara consulta a cada chamada é
  amplificador de carga barato, e um monitor que reinicia a aplicação porque o
  banco piscou troca falha parcial por total.
- **Custo aceito:** não serve como prontidão de verdade. Check profundo é
  outra rota, autenticada — está em "Fora de Escopo" na spec.

### D6, estilo embutido na tela de falha do layout raiz

- **Contexto:** essa tela substitui o documento inteiro, então não pode contar
  com fonte, provedor de tema nem componentes compartilhados (RF-05).
- **Alternativas:** (a) reusar os componentes; (b) estilo embutido.
- **Escolha:** (b). O que quebrou pode ser justamente o que ela reusaria.
- **Custo aceito:** as cores ficam duplicadas fora do sistema de tema e não
  acompanham tema escuro. Tela feia que aparece vale mais que bonita que
  também estoura.

### D7, correção de dependência transitiva fixada no mesmo major

- **Contexto:** o gate de auditoria travou com advisories em dependências que
  o projeto não declara (SEC-27).
- **Alternativas:** (a) fixar a versão mais recente; (b) fixar a menor versão
  corrigida dentro do mesmo major; (c) elevar o limite do gate.
- **Escolha:** (b). A (a) empurra mudança incompatível para quem consome a
  dependência, e o erro aparece em runtime, não no build. A (c) é desligar o
  alarme.
- **Custo aceito:** a fixação precisa ser removida quando quem puxa a
  dependência subir sozinho, senão vira travamento invisível. A regra e o
  motivo ficaram no `SECURITY.md`, porque JSON não aceita comentário.

## 4. Fronteiras de Segurança (mapa → SEC-xx)

| Fronteira                           | Mecanismo                                                                     | SEC    |
| ----------------------------------- | ----------------------------------------------------------------------------- | ------ |
| Formulário de entrada → conta       | Verificação de senha sempre exercitada, contra valor descartável quando falta | SEC-20 |
| Envio de link consumido → conta     | Balde de limite por origem, antes de qualquer consulta                        | SEC-21 |
| Página → outra origem no navegador  | Cabeçalho de isolamento de contexto + proibição de embutir                    | SEC-22 |
| Cabeçalho de host → URL de callback | Host confiável exigido; aviso no boot quando o sinal falta                    | SEC-23 |
| Erro de servidor → tela do cliente  | Captura única no servidor; tela mostra só o código de correlação              | SEC-24 |
| Cadastro concorrente → unicidade    | Restrição do banco é a garantia; violação traduzida na recusa comum           | SEC-25 |
| Consulta pública → dependência      | Resposta não alcança banco nem cache, e não é cacheável                       | SEC-26 |
| Dependência → entrega               | Gate de auditoria falha em alta e crítica                                     | SEC-27 |

## 5. Estratégia de Dados / Cache

- **Leitura:** nada novo é cacheado. A consulta de estado é dinâmica por
  construção (marcada como tal), porque resposta prerenderizada diria "ok"
  com o processo morto.
- **Escrita:** mutação de dado por-usuário chama `refresh()`, que atualiza a
  cópia do cliente sem descartar o prerender da rota (D2). Nenhuma etiqueta
  de cache nova: não há leitura compartilhada nova para invalidar.
- **Dado de request:** as telas de falha e a consulta de estado não leem
  sessão. O que já lia segue sob `<Suspense>`, inalterado.

## 6. Estratégia de Testes

| Camada         | O que testar                                                                                              | Ferramenta            |
| -------------- | --------------------------------------------------------------------------------------------------------- | --------------------- |
| serviço        | Verificação de senha exercitada nos três caminhos (SEC-20); violação de unicidade traduzida (SEC-25)      | Vitest (repo mockado) |
| invólucro      | Ordem das checagens (sessão antes de validação), papel insuficiente com mensagem idêntica, erro mascarado | Vitest                |
| infraestrutura | Cabeçalhos presentes, consulta de estado não cacheável, atalho de teclado é o primeiro foco               | Playwright            |

O invólucro de mutação ganhou teste próprio porque toda Server Action passa
por ele e ele não tinha nenhum. O teste trava a **ordem**: pedido sem sessão e
com entrada inválida responde "não autorizado" sem devolver erro de campo, que
de outra forma revelaria o formato esperado a quem não está autenticado.

Os três testes de infraestrutura existem porque nenhum deles quebra uma tela
ao desaparecer — é o que os torna fáceis de perder num refactor.

## 7. Migrações / Rollout

Nenhuma mudança de schema, nenhum backfill.

- **Configuração:** `AUTH_TRUST_HOST` é nova e opcional; `AUTH_URL` passou a
  ser necessária em produção fora de plataforma conhecida, e já era
  documentada como tal. Ambas no `.env.example`.
- **Reversão:** as mudanças são independentes entre si e nenhuma altera dado
  persistido, então qualquer uma reverte isolada. A exceção é a subida de
  dependências, que reverte junto com o arquivo de lock.

## 8. Riscos & Mitigações

| Risco                                                                       | Impacto                                                       | Mitigação                                                                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Isolamento de contexto quebrar login social que use janela auxiliar         | Login por provedor para de concluir                           | Suposição registrada na spec; hoje o fluxo é por redirecionamento, coberto por teste ponta-a-ponta                |
| A verificação de host divergir da regra da biblioteca numa subida de versão | Aviso falso, ou ausência de aviso quando deveria haver        | Reconferida na 0.41.3; a divergência não afeta o comportamento, só o aviso                                        |
| Fixação de dependência transitiva esquecida                                 | Árvore travada em versão antiga sem ninguém saber por quê     | Regra de remoção registrada no `SECURITY.md`; o robô de dependências continua abrindo as subidas                  |
| Subida de minor do framework alterar prerender                              | Rota que era estática vira dinâmica, e o CDN para de servir   | Tabela de rotas do build comparada antes e depois: idêntica, mesma classificação                                  |
| Aviso de boot ser ignorado                                                  | Aplicação sobe em produção com verificação de sessão quebrada | Vem no boot e descreve a consequência; a alternativa (falhar) quebraria o build fora de plataforma conhecida (D3) |
