# Plano Técnico, Manutenção de Dependências e Endurecimento (Feature 004)

- **Spec:** [spec.md](./spec.md)
- **Data:** 2026-10-31
- **Constituição aplicável:** [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

> Escrito retroativamente, junto da spec. Ver a nota de processo em
> [spec.md](./spec.md).

---

## 1. Stack (o que mudou)

| Pacote                                                | Antes     | Depois        | Observação                                                      |
| ----------------------------------------------------- | --------- | ------------- | --------------------------------------------------------------- |
| `next` / `eslint-config-next`                         | `16.3.5`  | `16.4.3`      | 3 advisories críticos (RCE) e 2 altos corrigidos                |
| `react` / `react-dom`                                 | `19.2.7`  | `19.3.1`      |                                                                 |
| `zod`                                                 | `4.4.3`   | `4.6.7`       | Advisory alto (exaustão de memória)                             |
| `nodemailer`                                          | `9.1.1`   | `10.3.1`      | 14 advisories; v10 traz tipos próprios, `@types/nodemailer` sai |
| `vitest` / `@vitest/coverage-v8`                      | `4.1.11`  | `5.0.5`       | Advisory no `@vitest/mocker`                                    |
| `vite` (peer, agora explícito)                        | `8.1.3`   | `8.3.5`       | 5 advisories; declarado para não depender da resolução de peer  |
| `jsdom`                                               | `29.1.1`  | `30.1.3`      | Traz `undici@8`, fora da faixa vulnerável                       |
| `@testing-library/jest-dom`                           | `6.9.1`   | `7.0.1`       |                                                                 |
| `@hookform/resolvers`                                 | `5.4.0`   | `7.0.0`       | API do `zodResolver` inalterada para este uso                   |
| `motion`                                              | `12.42.2` | `14.9.0`      | Só `motion/react` é usado; API inalterada                       |
| `dotenv`                                              | `17.4.2`  | `18.0.9`      | `quiet: true` nos scripts                                       |
| `prettier-plugin-tailwindcss`                         | `0.7.2`   | `0.8.1`       |                                                                 |
| `@types/node`                                         | `24.10.1` | `24.19.2`     | Fica no major do runtime (`.nvmrc` = 24), não no `latest`       |
| `eslint`                                              | `9.39.4`  | `9.39.5`      | Ver D3                                                          |
| `pnpm` (`packageManager`)                             | `10.20.0` | `10.34.9`     | Ver D6                                                          |
| Demais (Radix, Upstash, Neon, Drizzle, Tailwind, …)   | —         | topo do major | Minor/patch                                                     |
| Actions (`checkout`, `setup-node`, `upload-artifact`) | `v4`      | `v7`          | Runtime Node 24; sem mudança de interface para este workflow    |
| `pnpm/action-setup`                                   | `v4`      | `v6`          |                                                                 |

## 2. Estrutura de Arquivos

```
next.config.ts                      # partialPrefetching
src/proxy.ts                        # export renomeado para `config`
src/lib/session.ts                  # connection() antes de auth()
src/lib/rate-limit.ts               # x-real-ip antes de x-forwarded-for
src/schemas/auth.schema.ts          # limite em bytes; schema de provedor social
src/actions/auth.actions.ts         # valida o provedor social
src/repositories/*-token repos      # consumeValid (DELETE … RETURNING)
src/services/auth.service.ts        # consome o token antes do efeito
.github/workflows/ci.yml            # versões, permissions, persist-credentials
package.json                        # versões, engines, overrides com escopo
```

## 3. Decisões

### D1, `partialPrefetching: true` + `connection()` na leitura de sessão

- **Contexto:** o Next 16.4 avisa quando `cacheComponents` está ligado sem
  decidir `partialPrefetching`, que vira padrão no próximo major. Não há
  `<Link prefetch>` legado no projeto, então a adoção não muda link nenhum.
- **Problema achado:** com a opção ligada, o App Shell passa a resolver
  cookies em tempo de request, e o `auth()` do Auth.js gera valor aleatório
  (token CSRF) nessa fase: erro `blocking-prerender-crypto` em `/` e `/login`.
  Isolado ligando e desligando a opção com o mesmo build.
- **Decisão:** `await connection()` em `getCurrentUser`, o ponto único por
  onde toda leitura de sessão passa. A sessão sai do App Shell e chega por
  streaming; o resto da rota continua prefetchado.
- **Alternativa rejeitada:** `partialPrefetching: false`. Adia o problema para
  o próximo major, quando a opção deixa de existir.
- **Verificação:** tabela de rotas do build idêntica à anterior (todo `◐`
  continua `◐`); E2E sem erro no log do servidor.

### D2, `config`, não `proxyConfig`

- O Next só lê o export `config` do `proxy.ts`. O nome errado (desde o
  primeiro commit) fazia o matcher ser ignorado em silêncio: o proxy rodava em
  toda requisição, inclusive asset estático. Sem brecha de segurança, porque o
  gate só age nos prefixos protegidos, mas custo por requisição à toa.

### D3, majors não adotados

- **TypeScript 7:** o Next 16.4 suporta (checa tipos pelo `tsc` do projeto),
  mas o `typescript-eslint`, carregado pelo `eslint-config-next`, declara
  `typescript <6.1.0`: ele depende da API JS do compilador, que o TS 7 ainda
  não tem. Fica no `6.0.3`.
- **ESLint 10:** `eslint-plugin-react`, `-import` e `-jsx-a11y`, carregados
  pelo `eslint-config-next`, declaram até ESLint 9. Fica no `9.39.5`.
- **`@types/node` 26:** os tipos seguem o major do runtime, não o `latest`.

### D4, overrides com escopo

A revisão achou dois overrides globais **rebaixando major**: `brace-expansion`
forçava a 1.x também no `minimatch@10`, que pede `^5`; `undici` forçava a 7.x
no `jsdom@30`, que pede `^8`. Os testes passavam por sorte.

- Override passa a ter escopo (`pai@faixa>filho`) quando só um consumidor
  precisa dele: `minimatch@3>brace-expansion`, `postcss>nanoid`.
- Saem os que o próprio dependente já resolve: `@auth/core` (fixado em
  `0.41.3` por `next-auth` e pelo adapter), `sharp` (`next` pede `^0.35.5`),
  `postcss`, `js-yaml`, `undici`.
- Ficam como piso os que o dependente ainda aceita em versão vulnerável:
  `baseline-browser-mapping`, `browserslist`, `source-map-js`.

Regra registrada no `SECURITY.md`.

### D5, advisories moderados aceitos

- **`esbuild <=0.25` via `drizzle-kit` → `@esbuild-kit/core-utils`:** a falha
  é no servidor de desenvolvimento do esbuild (`serve`), que o `@esbuild-kit`
  não usa. Forçar a 0.25 cruzaria fronteira de breaking change (semver 0.x)
  para corrigir algo inalcançável. Um override assim chegou a ser testado e
  foi revertido por violar D4.
- **`minimatch <11` via ESLint 9:** a entrada são os globs do próprio
  repositório. Corrigido só no minimatch 11, que o ESLint 9 não usa.

### D6, engines e gerenciador de pacotes

- `engines.node`: `^22.22.2 || >=24.15.0`, o mínimo do `jsdom@30` (o
  `vitest@5` já exigia 22.12+). O Node 20 saiu de suporte.
- pnpm sobe no topo do major 10. O 11/12 muda configuração e lockfile;
  fica para uma mudança própria.

### D7, endurecimentos

- **SEC-28:** o bcrypt lê só 72 bytes. Limite em bytes UTF-8 via
  `TextEncoder`, que existe no browser e no Node (schema compartilhado). O
  login não ganha limite: senhas antigas maiores continuam entrando, já que
  o verificador trunca do mesmo jeito.
- **SEC-29:** `DELETE … WHERE hash AND não expirado RETURNING`. O consumo
  acontece antes do efeito: se a troca de senha falhar depois, pede-se outro
  link, o que é melhor que um link reaproveitável.
- **SEC-30:** a Server Action do login social recebia `string` livre. Agora
  `z.enum` + checagem de provedor configurado.
- **SEC-31:** `x-real-ip` é escrito pelo proxy (Vercel; nginx com
  `$remote_addr`); o primeiro item do `x-forwarded-for` é o que o cliente
  mandou. Onde o proxy não define `x-real-ip`, o comportamento é o anterior.
- **SEC-32:** `permissions: contents: read` e `persist-credentials: false`.

## 4. Riscos

| Risco                                      | Mitigação                                                         |
| ------------------------------------------ | ----------------------------------------------------------------- |
| Sessão deixa de vir no App Shell (D1)      | Chega por streaming, já sob `<Suspense>`; rotas seguem `◐`        |
| Ambiente local com Node 24 < 24.15         | O pnpm só avisa; atualizar o Node, que tem correções de segurança |
| Senha de cadastro antigo acima de 72 bytes | Login inalterado; o limite vale só para senha nova                |
