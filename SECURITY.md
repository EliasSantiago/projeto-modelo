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
