# Política de Segurança

## Reportar uma vulnerabilidade

**Não abra issue pública para falha de segurança.** Issue é indexada por
buscador e vira roteiro de ataque antes de existir correção.

Use um destes canais privados:

1. **GitHub Security Advisories** (preferido): aba _Security_ → _Report a
   vulnerability_. Cria um canal privado com o mantenedor.
2. **E-mail**: `contato@orkestrai.com.br`.

Inclua, se possível:

- tipo da falha e onde ela está (arquivo, rota, fluxo);
- passos para reproduzir, ou prova de conceito;
- impacto de quem explorar (leitura de dado alheio? escalada de privilégio?);
- versão/commit em que foi observada.

Retorno esperado em até **5 dias úteis**. Este é um projeto mantido em regime
de melhor esforço: não há SLA contratual.

## Escopo

Este repositório é um **template**. Quem o adota assume a segurança do que
construir em cima.

**No escopo:** falha no código deste repositório — bypass de autenticação ou
autorização, vazamento de secret, injeção, falha nos controles listados em
`specs/001-projeto-modelo/spec.md` (seção 8).

**Fora do escopo:**

- Vulnerabilidade em dependência de terceiro sem exploração demonstrada aqui
  (reporte ao projeto de origem; o CI já roda `pnpm audit`).
- Configuração incorreta de quem usa o template (secret commitado, `AUTH_SECRET`
  fraco, banco exposto).
- Ausência de rate limiting distribuído quando `UPSTASH_REDIS_REST_*` não foi
  configurado — é comportamento documentado, não defeito.

## Advisories de dependência

O job `auditoria de dependências` do CI roda `pnpm audit --audit-level high`:
falha em **alta e crítica**, ignora o resto. Severidade baixa ou moderada em
devDependency travaria o merge sem reduzir risco real de quem roda isso em
produção.

Advisory em dependência **direta** se resolve subindo a versão no
`package.json`. Em dependência **transitiva**, onde não se controla o
`package.json` de quem a puxa, use `pnpm.overrides`.

Duas regras para os overrides, porque é fácil trocar um problema por outro:

1. **Fixe a menor versão corrigida DENTRO do mesmo major.** Um override para
   `js-yaml@^5` conserta o advisory e quebra todo pacote escrito para a API
   da 4.x — e o erro aparece em runtime, não no build.
2. **Remova o override quando quem puxa a dependência subir sozinho.** Override
   esquecido é pin invisível: segura a árvore inteira numa versão antiga e
   ninguém lembra por quê.
3. **Dê escopo ao override quando só um consumidor precisa dele**
   (`"minimatch@3>brace-expansion": "^1.1.18"`). Um override global vale para
   TODO consumidor do pacote, inclusive os de outro major: um
   `brace-expansion@^1` global rebaixava o `minimatch@10`, que pede `^5`, e
   nenhum teste acusou. Confira com `pnpm why <pacote>` depois de aplicar.

### Advisories moderados aceitos

- **`esbuild` via `drizzle-kit` → `@esbuild-kit/core-utils`:** a falha está no
  servidor de desenvolvimento do esbuild (`serve`), que o `@esbuild-kit` não
  usa. A correção exigiria cruzar breaking change (semver 0.x).
- **`minimatch` via ESLint 9:** a entrada são os globs do próprio repositório.
  Corrigido só no minimatch 11, que o ESLint 9 não usa.

Revise esta lista a cada atualização do `drizzle-kit` e do ESLint.

## Antes do primeiro deploy

- **`AUTH_SECRET` forte e exclusivo.** Em produção o boot recusa o valor do
  `.env.example` e qualquer segredo com menos de 32 caracteres: quem conhece o
  segredo fabrica sessão válida, inclusive de admin. Gere com
  `npx auth secret`.
- **Não rode `pnpm db:seed` no banco de produção.** Ele se recusa quando
  `NODE_ENV` ou `VERCEL_ENV` é `production`, mas não tem como saber para onde o
  `DATABASE_URL` aponta. As contas demo usam senha aleatória a cada execução.

## Limitações conhecidas

Estão documentadas de propósito, não são descuido:

- **CSP com `'unsafe-inline'` em `script-src`.** Exigido pelos scripts inline
  do Next. A CSP barra carregamento de recurso externo, **não** XSS inline.
  Migrar para nonce exige gerar o nonce no `proxy.ts` e abrir mão do PPR.
- **Rate limiting em memória sem Redis.** Em serverless o limite não é
  compartilhado entre instâncias; o limite efetivo vira `cota × instâncias`.
- **Papel em cache no JWT.** O papel é lido no sign-in, então revogação de
  privilégio só vale no próximo login. Para revogação imediata, leia o papel
  a cada request ou invalide a sessão.
- **Redefinir a senha não derruba sessões ativas.** A sessão é um JWT
  assinado e vale até expirar. Quem redefine a senha porque a conta foi
  tomada continua com o invasor logado até lá. Para revogação, guarde uma
  versão de sessão no usuário e confira no callback `jwt` (custa uma leitura
  por request) ou troque para sessão em banco.
- **Rate limit de login por origem + conta, não só por conta.** Impede que um
  atacante trave o login alheio, mas não limita tentativas vindas de muitas
  origens contra a mesma conta. O IP vem de `x-real-ip` e, na falta dele, do
  primeiro item do `x-forwarded-for`, que só é confiável quando o proxy da
  borda sobrescreve o header (a Vercel faz isso). Fora da Vercel, configure o
  proxy para definir `x-real-ip`.
- **`emailVerified` em cache no JWT**, pela mesma razão. Quem confirma o
  e-mail durante uma sessão ativa só vê a mudança refletida no próximo login
  — é o que a tela de confirmação pede. Se a sua app impuser
  `requireVerifiedUser()`, avalie renovar a sessão logo após a confirmação.
- **Conta não verificada não é bloqueada.** A confirmação de e-mail existe e
  funciona, mas não impede login por padrão: impor a política quebraria contas
  criadas antes da feature. Use `requireVerifiedUser()` nas rotas que exigem
  um canal de contato confiável.
- **`next-auth` em versão beta** (`5.0.0-beta.x`), estado atual do ecossistema
  Auth.js v5.
