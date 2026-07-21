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
- **Conta não verificada não é bloqueada.** A confirmação de e-mail existe e
  funciona, mas não impede login por padrão: impor a política quebraria contas
  criadas antes da feature. Use `requireVerifiedUser()` nas rotas que exigem
  um canal de contato confiável.
- **`next-auth` em versão beta** (`5.0.0-beta.x`), estado atual do ecossistema
  Auth.js v5.
