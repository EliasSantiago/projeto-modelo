import type { Instrumentation } from 'next'
import { authHostIsTrusted } from '@/lib/env.server'
import { logger } from '@/lib/logger'

/**
 * Instrumentação do Next.js. Roda uma vez por processo, antes de servir a
 * primeira requisição.
 *
 * Serve a dois propósitos aqui:
 *
 *  1. **Fail fast de configuração.** Importar o logger arrasta
 *     `lib/env.server`, que valida as variáveis com Zod e lança se algo
 *     estiver faltando. Um boot que falha com a lista do que está errado é
 *     muito melhor que a primeira requisição do dia estourando em produção.
 *  2. **Captura central de erro de servidor.** `onRequestError` recebe TODO
 *     erro não tratado de render, Route Handler, Server Action e proxy — nos
 *     dois runtimes. É o ponto certo para plugar Sentry & cia. sem espalhar
 *     try/catch pelo código.
 */
export function register(): void {
  logger.info('Servidor iniciado', {
    runtime: process.env.NEXT_RUNTIME ?? 'nodejs',
  })

  // Aviso, e não exceção: derrubar o boot quebraria `next build` fora da
  // Vercel, onde o host de produção ainda nem existe. Mesmo espírito do
  // aviso de rate limiting em memória (`lib/rate-limit.ts`).
  if (!authHostIsTrusted) {
    logger.warn(
      'AUTH_URL não definida em produção: o Auth.js vai recusar o header ' +
        'Host (UntrustedHost) e toda chamada a auth() vai falhar. Defina ' +
        'AUTH_URL com a URL canônica da app, ou AUTH_TRUST_HOST=true se ' +
        'houver um proxy reverso confiável na frente.',
    )
  }

  // Para ligar um serviço de observabilidade, inicialize-o aqui e registre o
  // reporter uma única vez (ver o exemplo de Sentry no fim de `lib/logger.ts`):
  //
  //   const Sentry = await import('@sentry/nextjs')
  //   Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 })
  //   setErrorReporter((error, context) =>
  //     Sentry.captureException(error, { extra: context }),
  //   )
}

/**
 * Erro não tratado durante uma requisição.
 *
 * O contexto guarda apenas o que ajuda a diagnosticar (rota, método, tipo de
 * render). Nada de headers ou corpo: seriam cookie e token dentro do log, e o
 * `redact` do logger é rede de segurança, não licença para passar segredo.
 */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  logger.error('Erro não tratado na requisição', error, {
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
  })
}
