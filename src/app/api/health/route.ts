import { connection } from 'next/server'
import { APP } from '@/constants/app'

/**
 * Health check para orquestrador, uptime monitor e smoke test de deploy.
 *
 * É **raso de propósito**: responde "este processo subiu e está servindo".
 * Não toca no banco nem no Redis — um endpoint público que dispara query a
 * cada chamada vira amplificador de carga barato, e um monitor que reinicia
 * a aplicação porque o banco piscou troca uma falha parcial por uma total.
 *
 * Precisa de um check profundo (readiness de verdade)? Crie uma rota
 * SEPARADA, protegida por token, e faça ali o `select 1`. Assim o probe
 * público continua barato e o caro fica com quem opera (SEC-26).
 */
export async function GET() {
  // Marca a rota como dinâmica: health check prerenderizado no build
  // responderia "ok" mesmo com o processo morto.
  await connection()

  return Response.json(
    {
      status: 'ok',
      app: APP.name,
      timestamp: new Date().toISOString(),
    },
    {
      // Nenhuma camada entre o monitor e o processo pode responder por ele.
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
