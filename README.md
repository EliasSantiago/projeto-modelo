# Projeto Modelo — Next.js

Starter **moderno, escalável, seguro e pronto para produção** para novos
produtos. Traz autenticação, banco de dados, arquitetura em camadas, UI,
testes, qualidade e documentação já configurados — e uma feature de
referência (`tasks`) demonstrando o fluxo completo ponta-a-ponta.

Construído com **Spec-Driven Development (SDD)**: as decisões vivem em
`specs/` e `.specify/memory/constitution.md` antes do código.

---

## 📑 Índice

- [Tecnologias](#-tecnologias)
- [Arquitetura](#️-arquitetura-camadas)
- [Pré-requisitos](#-pré-requisitos)
- [Como rodar o projeto](#-como-rodar-o-projeto)
- [Como configurar o `.env`](#-como-configurar-o-env)
- [Scripts](#-scripts)
- [Segurança](#-segurança-owasp-top-10)
- [Testes](#-testes)
- [Deploy](#️-deploy-vercel--neon)
- [Spec-Driven Development](#-spec-driven-development)
- [Autor](#-autor)
- [Licença](#-licença)

---

## ✨ Tecnologias

| Categoria       | Tecnologia                                                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**   | [Next.js 16](https://nextjs.org) — App Router, RSC, Server Actions, Turbopack, Cache Components (PPR)                                                                  |
| **Linguagem**   | [TypeScript 6](https://www.typescriptlang.org) (strict mode)                                                                                                           |
| **UI runtime**  | [React 19](https://react.dev)                                                                                                                                          |
| **Estilo**      | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first)                                                                                                                 |
| **Componentes** | [ShadCN/UI](https://ui.shadcn.com) · [Heroicons](https://heroicons.com) · [Motion](https://motion.dev)                                                                 |
| **Tema**        | [next-themes](https://github.com/pacocoursey/next-themes) (claro/escuro)                                                                                               |
| **Formulários** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) (validação única no cliente e no servidor)                                                     |
| **ORM**         | [Drizzle ORM](https://orm.drizzle.team)                                                                                                                                |
| **Banco**       | [Neon Postgres](https://neon.tech) (serverless)                                                                                                                        |
| **Auth**        | [Auth.js v5](https://authjs.dev) — e-mail/senha (criar conta, login, recuperação) + OAuth Google/GitHub                                                                |
| **Estado**      | [Zustand](https://zustand-demo.pmnd.rs) (quando necessário)                                                                                                            |
| **Testes**      | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) · [Playwright](https://playwright.dev)                                                   |
| **Qualidade**   | [ESLint](https://eslint.org) · [Prettier](https://prettier.io) · [Husky](https://typicode.github.io/husky) · [lint-staged](https://github.com/lint-staged/lint-staged) |
| **Gerenciador** | [pnpm](https://pnpm.io)                                                                                                                                                |

## 🏛️ Arquitetura (camadas)

Dependências fluem num sentido só:

```
app / components  →  features / hooks  →  actions
actions  →  services  →  repositories  →  db
schemas · types · lib · utils · constants · providers  (transversais)
```

| Pasta                           | Responsabilidade                                        |
| ------------------------------- | ------------------------------------------------------- |
| `app/`                          | Rotas, layouts, loading/error (App Router)              |
| `components/ui`                 | Componentes ShadCN (apresentacional puro)               |
| `components/layout`             | Header, footer, theme toggle                            |
| `features/`                     | Slices de feature (ex.: `tasks`)                        |
| `actions/`                      | Server Actions: validam (Zod) + autorizam + orquestram  |
| `services/`                     | Regras de negócio; orquestram repositories              |
| `repositories/`                 | **Único** acesso ao Drizzle (queries parametrizadas)    |
| `db/`                           | Schema, client Neon, seed                               |
| `schemas/`                      | Schemas Zod — fonte da verdade dos tipos                |
| `lib/`                          | Infra: `auth`, `env`, `session`, `safe-action`, `utils` |
| `hooks/`                        | Hooks de cliente reutilizáveis                          |
| `providers/`                    | Client providers (tema)                                 |
| `types` · `utils` · `constants` | Tipos, funções puras, constantes                        |

Detalhes e justificativas: [`specs/001-projeto-modelo/plan.md`](./specs/001-projeto-modelo/plan.md).

## 📋 Pré-requisitos

- **Node.js 20+** (recomendado 24 — veja `.nvmrc`)
- **pnpm 10+** — instale com `npm install -g pnpm`
- Uma conta e um banco no **[Neon](https://neon.tech)** (gratuito para começar)
- (Opcional) Credenciais OAuth do **Google** e/ou **GitHub**
- (Opcional) Um servidor **SMTP** para e-mail de recuperação de senha

## 🚀 Como rodar o projeto

```bash
# 1. Clone o repositório
git clone git@github.com:EliasSantiago/projeto-modelo.git
cd projeto-modelo

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente (veja a seção abaixo)
cp .env.example .env.local

# 4. Aplique o schema no banco Neon
pnpm db:generate   # gera o SQL a partir do schema Drizzle
pnpm db:migrate    # aplica as migrações no banco
pnpm db:seed       # (opcional) popula com dados de exemplo

# 5. Suba o servidor de desenvolvimento
pnpm dev
```

Acesse **http://localhost:3000**. 🎉

> 💡 Não tem OAuth/SMTP ainda? O projeto sobe mesmo assim: a tela de login
> mostra apenas os provedores que estiverem configurados no `.env.local`.

### Páginas de autenticação

O starter já inclui o fluxo completo com design split-screen:

- `/register` — criação de conta (nome, e-mail, senha)
- `/login` — login por e-mail/senha + OAuth
- `/forgot-password` — solicitar link de recuperação
- `/reset-password?token=...` — definir nova senha
- `/dashboard` — área privada com métricas e a feature `tasks`

Após rodar `pnpm db:seed`, use as credenciais de demonstração:
**`demo@example.com`** / **`password123`**.

## 🔧 Como configurar o `.env`

Copie o arquivo de exemplo e preencha os valores em **`.env.local`**
(esse arquivo é ignorado pelo Git e **nunca** deve ser commitado):

```bash
cp .env.example .env.local
```

### Variáveis

| Variável                      | Escopo      | Obrigatória | Descrição                                              |
| ----------------------------- | ----------- | :---------: | ------------------------------------------------------ |
| `DATABASE_URL`                | servidor    |     ✅      | Connection string do Neon (use a **pooled**)           |
| `AUTH_SECRET`                 | servidor    |     ✅      | Segredo do Auth.js                                     |
| `AUTH_URL`                    | servidor    |   em prod   | URL canônica da aplicação                              |
| `AUTH_GOOGLE_ID` / `_SECRET`  | servidor    |  opcional   | Credenciais OAuth do Google                            |
| `AUTH_GITHUB_ID` / `_SECRET`  | servidor    |  opcional   | Credenciais OAuth do GitHub                            |
| `AUTH_EMAIL_SERVER` / `_FROM` | servidor    |  opcional   | SMTP + remetente para o e-mail de recuperação de senha |
| `NEXT_PUBLIC_APP_NAME`        | **cliente** |     ✅      | Nome público da aplicação                              |
| `NEXT_PUBLIC_APP_URL`         | **cliente** |     ✅      | URL pública da aplicação                               |

### Passo a passo dos valores

1. **`DATABASE_URL`** — no painel do [Neon](https://neon.tech), copie a
   connection string **pooled** (algo como
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require`).

2. **`AUTH_SECRET`** — gere um segredo forte:

   ```bash
   npx auth secret          # grava direto no .env.local
   # ou
   openssl rand -base64 32
   ```

3. **Google OAuth** — em
   [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials),
   crie um "OAuth Client ID" (Web) e adicione o redirect:
   `http://localhost:3000/api/auth/callback/google`.

4. **GitHub OAuth** — em
   [GitHub → Developer settings → OAuth Apps](https://github.com/settings/developers),
   crie um app com callback:
   `http://localhost:3000/api/auth/callback/github`.

5. **E-mail (recuperação de senha)** — informe um `AUTH_EMAIL_SERVER`
   (`smtp://user:pass@host:587`) e um `AUTH_EMAIL_FROM`.

> 🔒 **Segurança:** apenas variáveis com prefixo `NEXT_PUBLIC_` chegam ao
> browser. Todos os secrets são validados por `src/lib/env.server.ts` (com
> `server-only`) e **nunca** entram no bundle do cliente. Em produção,
> configure as mesmas variáveis no painel da Vercel.

## 📜 Scripts

| Comando                                       | Ação                         |
| --------------------------------------------- | ---------------------------- |
| `pnpm dev`                                    | Servidor de desenvolvimento  |
| `pnpm build` / `pnpm start`                   | Build e execução de produção |
| `pnpm typecheck`                              | `tsc --noEmit` (strict)      |
| `pnpm lint` / `pnpm lint:fix`                 | ESLint                       |
| `pnpm format` / `pnpm format:check`           | Prettier                     |
| `pnpm test` / `pnpm test:watch`               | Vitest (unit + componente)   |
| `pnpm test:e2e`                               | Playwright (E2E)             |
| `pnpm db:generate` / `db:migrate` / `db:push` | Migrações Drizzle            |
| `pnpm db:seed` / `db:studio`                  | Seed / Drizzle Studio        |

## 🔐 Segurança (OWASP Top 10)

Controles já implementados — rastreáveis em
[`spec.md`](./specs/001-projeto-modelo/spec.md) (seção 8):

- Separação de env servidor/cliente + `server-only` (nada de secret no bundle).
- Banco acessível **só** no servidor; queries parametrizadas via Drizzle.
- Toda entrada validada com **Zod** antes de qualquer efeito.
- Server Actions protegidas por `authAction` (autentica + valida + autoriza).
- Autorização por posse do recurso (`task.userId === session.user.id`).
- Cookies de sessão `HttpOnly` / `Secure` / `SameSite`.
- Erros nunca vazam detalhes sensíveis ao cliente.

## 🧪 Testes

```bash
pnpm test        # schemas, services (repo mockado), utils, componentes
pnpm test:e2e    # fluxo de login/gate de rota (Playwright)
```

## ☁️ Deploy (Vercel + Neon)

1. Crie um banco no **Neon** e copie a connection string (pooled).
2. Importe o repositório na **Vercel**.
3. Configure as variáveis de ambiente (as mesmas do `.env.local`).
   Localmente você pode sincronizar com `vercel env pull .env.local`.
4. Aplique as migrações contra o banco de produção:
   `pnpm db:migrate` (com `DATABASE_URL` de produção).
5. Faça o deploy. O `next build` roda com Cache Components (PPR) habilitado.

> Configure os callbacks de OAuth para o domínio de produção:
> `https://SEU-DOMINIO/api/auth/callback/{google|github}`.

## 🧭 Spec-Driven Development

Este projeto foi construído seguindo SDD. Os artefatos:

- [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) — princípios inegociáveis
- [`specs/001-projeto-modelo/spec.md`](./specs/001-projeto-modelo/spec.md) — o quê e por quê
- [`specs/001-projeto-modelo/plan.md`](./specs/001-projeto-modelo/plan.md) — como (decisões técnicas)
- [`specs/001-projeto-modelo/tasks.md`](./specs/001-projeto-modelo/tasks.md) — tarefas rastreáveis

Para uma nova feature, siga a mesma ordem: **constitution → spec → plan →
tasks → implementação**. Veja [`AGENTS.md`](./AGENTS.md).

## 👤 Autor

**Elias Fonseca**

- GitHub: [@EliasSantiago](https://github.com/EliasSantiago)

Desenvolvido como um projeto modelo para acelerar o início de novos produtos
Next.js com segurança, arquitetura e qualidade desde o primeiro commit.
Contribuições e sugestões são bem-vindas!

## 📄 Licença

Distribuído sob a licença **MIT**.
