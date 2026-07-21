import 'server-only'

/**
 * Convenções de cache do projeto (Cache Components / PPR, Next.js 16+).
 *
 * O `cacheComponents: true` do `next.config.ts` divide toda renderização em
 * três categorias. Saber em qual o seu código cai é o que evita tanto página
 * lenta quanto dado velho:
 *
 *  1. **Estático** — código síncrono, sem `await` de dado de request. É
 *     prerenderizado no build e servido pelo CDN da Vercel. É onde a maior
 *     parte deste projeto já está (`/`, `/docs`, widgets do dashboard): não
 *     precisa de diretiva nenhuma, e adicionar cache aí só piora.
 *  2. **Cacheado** — função `async` marcada com uma das diretivas abaixo.
 *  3. **Dinâmico** — leu `cookies()`/`headers()`/`searchParams`. Precisa
 *     estar dentro de `<Suspense>`, senão o build falha.
 *
 * ## Qual diretiva usar
 *
 * | Diretiva              | Onde vive           | Use para                          |
 * | --------------------- | ------------------- | --------------------------------- |
 * | `'use cache'`         | Memória da instância| Conteúdo do shell estático        |
 * | `'use cache: remote'` | Runtime Cache Vercel| Dado COMPARTILHADO e caro         |
 * | `'use cache: private'`| Memória do browser  | Dado por-usuário (experimental)   |
 *
 * ## A regra que mais se erra
 *
 * `'use cache: remote'` grava no Runtime Cache da Vercel, que é **compartilhado
 * entre todos os visitantes**. Nunca coloque nele dado de um usuário só: cada
 * usuário viraria uma entrada distinta (taxa de acerto perto de zero, pagando
 * armazenamento à toa) e qualquer erro na chave de cache vira vazamento de
 * dado entre contas.
 *
 * A saída é cachear pela dimensão de POUCOS valores distintos, não pelo
 * usuário. Em vez de `getPerfil(userId)`, cacheie `getConteudo(idioma)` e
 * escolha o idioma a partir da sessão:
 *
 * ```ts
 * // ✅ uma entrada por idioma (~10), compartilhada por todos
 * async function getConteudo(idioma: string) {
 *   'use cache: remote'
 *   cacheTag(cacheTags.conteudo)
 *   cacheLife(CACHE_PROFILES.sharedData)
 *   return cms.buscar(idioma)
 * }
 * ```
 *
 * Por isso a lista de tarefas (`task.repository.ts`) NÃO é cacheada: é dado
 * por-usuário, muda a cada mutação e já resolve numa query indexada. Cache ali
 * seria custo e risco sem ganho — ver `docs/caching.md`.
 *
 * ## Invalidação
 *
 * Marque a leitura com `cacheTag(...)` e invalide na Server Action:
 *
 *  - `updateTag(tag)` — imediato, o mesmo request já lê o valor novo
 *    (read-your-own-writes). Só funciona em Server Action.
 *  - `revalidateTag(tag, 'max')` — stale-while-revalidate, serve o valor
 *    antigo enquanto atualiza em segundo plano.
 *
 * Prefira tag a `revalidatePath`: o path derruba a rota inteira, inclusive o
 * shell estático que não mudou.
 */

/**
 * Perfis de tempo de vida, em segundos, para passar a `cacheLife()`.
 *
 *  - `stale`      — por quanto tempo o cliente reusa sem perguntar ao servidor;
 *  - `revalidate` — de quanto em quanto tempo o servidor atualiza em background;
 *  - `expire`     — limite duro: passado isso, espera-se dado novo.
 *
 * São nomeados por intenção, não por duração, para que o call site diga o
 * porquê. Ajuste os números aqui e todo o projeto acompanha.
 */
export const CACHE_PROFILES = {
  /**
   * Cromo do site: rodapé, navegação, textos institucionais. Só muda quando
   * alguém edita o código, então vale segurar por bastante tempo.
   */
  chrome: { stale: 3600, revalidate: 86_400, expire: 604_800 },

  /**
   * Dado compartilhado vindo do banco ou de uma API interna (métricas
   * agregadas, catálogo, listagens públicas). Curto o suficiente para não
   * exibir número velho, longo o suficiente para poupar o banco.
   */
  sharedData: { stale: 60, revalidate: 300, expire: 3600 },

  /**
   * Upstream de terceiro com rate limit ou instabilidade. Aqui o cache existe
   * para proteger o fornecedor, então segura mais e tolera dado um pouco velho.
   */
  externalApi: { stale: 300, revalidate: 3600, expire: 86_400 },
} as const

/**
 * Tags de cache centralizadas.
 *
 * Tag literal espalhada pelo código é como string de rota espalhada: um typo
 * não quebra o build, só faz a invalidação silenciosamente não acontecer.
 * Declare aqui e importe.
 *
 * Ao criar uma feature com leitura compartilhada, adicione a tag neste objeto,
 * chame `cacheTag(...)` dentro da função cacheada e `updateTag(...)` na Server
 * Action que a modifica.
 */
export const cacheTags = {
  /** Cromo do site (rodapé e afins), invalidável sem redeploy. */
  chrome: 'chrome',
} as const

export type CacheTag = (typeof cacheTags)[keyof typeof cacheTags]
