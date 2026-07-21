# Especificação, Projeto Modelo Next.js (Feature 001)

- **ID:** 001-projeto-modelo
- **Status:** Aprovada
- **Data:** 2026-07-04
- **Constituição aplicável:** [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

---

## 1. Resumo Executivo

Como **Arquiteto de Software Sênior**, entregar um **projeto modelo (starter/template)**
Next.js moderno, escalável, seguro e pronto para produção. Serve de base para novos
produtos: já traz autenticação, banco de dados, camadas de arquitetura, UI, testes,
qualidade e documentação configurados e demonstrados por uma feature de referência
ponta-a-ponta.

## 2. Objetivos

- **O1**, Base técnica reutilizável que times clonam e começam a produzir no mesmo dia.
- **O2**, Segurança "by default" comprovável (OWASP Top 10) desde o commit inicial.
- **O3**, Arquitetura em camadas clara, escalável e testável.
- **O4**, Fluxo completo demonstrado (auth + CRUD com validação, persistência e UI).
- **O5**, Deploy em Vercel + Neon sem ajustes manuais além de variáveis de ambiente.

## 3. Fora de Escopo

- Regras de negócio de um produto específico (a feature de referência é ilustrativa).
- Pagamentos, e-mail transacional, i18n, multi-tenancy (ganchos previstos, não implementados).
- Pipeline de CI/CD além do gate local de qualidade (documentado, não configurado em nuvem).

## 4. Personas

- **Dev do time**, clona, roda `pnpm dev`, entende a estrutura em minutos.
- **Usuário final**, cria conta / faz login (e-mail, Google, GitHub) e usa a feature.
- **Revisor de segurança**, audita e encontra os controles OWASP já no lugar.

## 5. Requisitos Funcionais

| #     | Requisito                                | Critério de Aceite                                                                 |
| ----- | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| RF-01 | Autenticação por e-mail, Google e GitHub | Usuário conclui login pelos 3 provedores; sessão persistida em cookie seguro       |
| RF-02 | Rotas privadas protegidas                | Acesso não autenticado a rota privada redireciona para login                       |
| RF-03 | Feature de referência CRUD ("tasks")     | Criar, listar, atualizar e remover itens do usuário autenticado                    |
| RF-04 | Validação de formulários                 | Toda entrada validada com Zod no cliente **e** no servidor; erros exibidos no form |
| RF-05 | Tema claro/escuro                        | Alternância persistida, sem flash de tema incorreto                                |
| RF-06 | Feedback de UI                           | Estados de loading (Suspense/skeleton) e erros amigáveis                           |
| RF-07 | Landing + navegação                      | Home pública, dashboard privado, header com estado de sessão                       |

## 6. Requisitos Não-Funcionais

| #      | Categoria      | Requisito                                                                  |
| ------ | -------------- | -------------------------------------------------------------------------- |
| RNF-01 | Segurança      | Cumprir todos os controles do Princípio III da constituição (OWASP Top 10) |
| RNF-02 | Performance    | LCP com streaming; imagens e fontes otimizadas; JS de cliente mínimo       |
| RNF-03 | Type-safety    | `tsc --noEmit` limpo em strict mode                                        |
| RNF-04 | Qualidade      | ESLint + Prettier limpos; gate de pre-commit ativo                         |
| RNF-05 | Testabilidade  | Unit (Vitest + Testing Library) e E2E (Playwright) executáveis             |
| RNF-06 | Escalabilidade | Camadas isoladas; adicionar nova feature não exige tocar em auth/db        |
| RNF-07 | Portabilidade  | Configuração 100% por variáveis de ambiente; deploy Vercel + Neon          |
| RNF-08 | DX             | `pnpm dev` sobe em um comando; scripts padronizados; README completo       |

## 7. Modelo de Domínio (feature de referência)

- **User**, identidade gerenciada pelo Auth.js (tabelas `users`, `accounts`, `sessions`, `verification_tokens`).
- **Task**, `id`, `userId` (FK → users), `title`, `completed`, `createdAt`, `updatedAt`.
  Um usuário possui muitas tasks; uma task pertence a um usuário e só é visível/editável por ele.

## 8. Requisitos de Segurança (rastreáveis)

| #      | Controle                                             | Verificação                                                                   |
| ------ | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| SEC-01 | Secrets nunca no cliente; só `NEXT_PUBLIC_*` exposto | Env validado por schema separando server/client                               |
| SEC-02 | DB só no servidor                                    | `import 'server-only'` na camada de db/repos                                  |
| SEC-03 | Toda entrada validada com Zod                        | Actions rejeitam payload inválido antes de qualquer efeito                    |
| SEC-04 | Autorização em Server Actions e rotas privadas       | Action confere sessão + posse do recurso (`task.userId === session.user.id`)  |
| SEC-05 | Queries parametrizadas                               | Uso exclusivo do query builder do Drizzle                                     |
| SEC-06 | Cookies HttpOnly/Secure/SameSite                     | Config do Auth.js                                                             |
| SEC-07 | Erros sem dados sensíveis                            | Mensagens genéricas ao cliente; log detalhado só no servidor                  |
| SEC-08 | Rate limiting em endpoints públicos de auth          | Login, cadastro e recuperação limitados por IP (`lib/rate-limit.ts`)          |
| SEC-09 | Security headers em todas as rotas                   | CSP, HSTS, X-Frame-Options, nosniff, Referrer/Permissions-Policy              |
| SEC-10 | Anti-enumeração de usuários                          | Recuperação responde igual exista ou não a conta, inclusive em falha de envio |
| SEC-11 | Falha de e-mail nunca é silenciosa em produção       | Sem SMTP configurado, o fluxo lança em vez de descartar a mensagem            |

## 9. Critérios de Aceite Globais (Definition of Done)

1. `pnpm install && pnpm build` conclui sem erros.
2. `pnpm typecheck`, `pnpm lint` e `pnpm test` passam.
3. Todos os RF e SEC verificáveis manualmente ou por teste.
4. README permite a um dev novo rodar local e fazer deploy sem ajuda externa.
5. Nenhuma violação da constituição.

## 10. Perguntas em Aberto / Suposições

- **[SUPOSIÇÃO]** Login por e-mail = magic link (Auth.js), exigindo provedor de e-mail;
  em dev usa transporte de console/log. Confirmar provedor SMTP em produção.
- **[SUPOSIÇÃO]** Banco: Neon Postgres serverless; driver HTTP para runtime serverless.
