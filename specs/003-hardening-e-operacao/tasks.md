# Tarefas, Endurecimento e Operação (Feature 003)

- **Referência:** [plan.md](./plan.md) · [spec.md](./spec.md)
- Ordem por dependência. `[P]` = paralelizável. Marque `[x]` ao concluir.

> Lista escrita retroativamente, junto da spec e do plano — ver a nota de
> processo em [spec.md](./spec.md). As tarefas estão marcadas como concluídas
> porque descrevem trabalho já feito e validado, não trabalho planejado. É
> registro, não plano: numa feature conduzida na ordem certa, esta lista
> nasceria vazia e seria preenchida ao longo da implementação.

---

## Fase 0, Fundação

- [x] T001 `src/constants/auth.ts` — nomes do cookie de sessão num lugar só,
      antes duplicados entre a configuração de auth e o gate de rota (RNF-06)
- [x] T002 `src/lib/auth.ts` e `src/proxy.ts` — consumir T001; restringir o
      gate aos caminhos que podem virar rota protegida (RNF-02)

## Fase 1, Dados

Nenhuma tarefa: a feature não acrescenta entidade nem coluna (spec, seção 7).

## Fase 2, Domínio

- [x] T020 `src/services/auth.service.ts` — verificação de senha exercitada
      também sem conta e sem senha cadastrada, contra valor descartável
      (RF-01, SEC-20)
- [x] T021 `src/services/auth.service.ts` — violação da restrição de unicidade
      do banco traduzida na recusa comum de endereço já cadastrado
      (RF-02, SEC-25)
- [x] T022 `src/lib/rate-limit.ts` — balde para consumo de link de uso único
      (RF-03, SEC-21)
- [x] T023 `src/actions/auth.actions.ts` — aplicar T022 na redefinição de
      senha, antes de consultar o link (RF-03, SEC-21)
- [x] T024 `src/actions/task.actions.ts` — `refresh()` no lugar da
      invalidação por caminho (RF-10)
- [x] T025 `src/lib/env.server.ts` — sinais de host confiável e verificação
      espelhando a regra da biblioteca (SEC-23)

## Fase 3, Interface

- [x] T030 `src/app/error.tsx` — falha de rota, sem exibir mensagem interna,
      mostrando o código de correlação (RF-05, RF-06, SEC-24)
- [x] T031 `src/app/global-error.tsx` — falha do layout raiz; estilo embutido
      porque substitui o documento inteiro (RF-05, plano D6)
- [x] T032 `src/app/unauthorized.tsx` — 401, par de `forbidden.tsx` (RF-05)
- [x] T033 `src/app/api/health/route.ts` — consulta de estado rasa e não
      cacheável (RF-08, SEC-26)
- [x] T034 `src/app/layout.tsx` — atalho para o conteúdo, invisível até
      receber foco (RF-09, RNF-05)
- [x] T035 Marco `<main id="conteudo">` nos três layouts: público,
      administrativo e de autenticação (RF-09, RNF-05)
- [x] T036 `next.config.ts` — isolamento de contexto de navegação e proibição
      de embutir (SEC-22)

## Fase 4, Observabilidade

- [x] T040 `src/instrumentation.ts` — captura única de erro de requisição, com
      rota, método e tipo de render; sem cabeçalho nem corpo (RF-04, SEC-24)
- [x] T041 `src/instrumentation.ts` — aviso de boot quando falta host
      confiável em produção (RF-07, SEC-23)

## Fase 5, Testes

- [x] T050 `src/lib/safe-action.test.ts` — invólucro de mutação: ordem das
      checagens, papel insuficiente com mensagem idêntica, erro mascarado [P]
- [x] T051 `src/services/auth.service.test.ts` — verificação sempre
      exercitada (SEC-20) e unicidade traduzida (SEC-25) [P]
- [x] T052 `tests/e2e/hardening.spec.ts` — cabeçalhos, consulta de estado e
      atalho de teclado; os três desaparecem sem quebrar tela nenhuma [P]
- [x] T053 `vitest.config.ts` — cobertura sobre a lógica de domínio;
      apresentação fora, coberta por fluxo ponta-a-ponta (RNF-07)

## Fase 6, Dependências

- [x] T060 Subir dependências diretas com advisory alto ou crítico (SEC-27)
- [x] T061 Fixar dependências transitivas na menor versão corrigida do mesmo
      major, via `pnpm.overrides` (SEC-27, plano D7)
- [x] T062 `SECURITY.md` — registrar a política de fixação e quando removê-la,
      já que JSON não aceita comentário (SEC-27)
- [x] T063 Confirmar que a subida de minor do framework não mudou a
      classificação de prerender: tabela de rotas do build comparada

## Fase 7, Fechamento

- [x] T070 `pnpm typecheck && pnpm lint && pnpm test && pnpm build` verdes
- [x] T071 `pnpm test:e2e` verde
- [x] T072 `README.md`, `SECURITY.md` e `.env.example` atualizados
- [x] T073 `AGENTS.md` — convenções novas (`refresh()`, indistinguibilidade
      em tempo, limite em endpoint que consome token)
- [x] T074 Novos controles registrados na tabela SEC desta `spec.md`
      (SEC-20 a SEC-27)
- [ ] T075 Revisão humana da spec e do plano retroativos: são o artefato que
      deveria ter vindo antes, e ninguém além de quem implementou os leu
