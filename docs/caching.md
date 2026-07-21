# Cache

Como este projeto usa o cache do Next.js 16 (Cache Components / PPR) sobre a
infraestrutura da Vercel, e — igualmente importante — **onde ele de propósito
não usa cache**.

Fonte da verdade em código: [`src/lib/cache.ts`](../src/lib/cache.ts).

## As três camadas na Vercel

Quando o projeto roda na Vercel, três caches distintos entram em jogo. Confundi-los
é a origem da maior parte dos bugs de "dado velho":

| Camada            | O que guarda                           | Quem invalida                  |
| ----------------- | -------------------------------------- | ------------------------------ |
| **CDN**           | HTML prerenderizado e assets estáticos | Deploy novo, `invalidateByTag` |
| **Runtime Cache** | Retorno de `'use cache: remote'`       | `cacheLife`, `updateTag`       |
| **Memória**       | Retorno de `'use cache'`               | `cacheLife`, fim da instância  |

O `cacheComponents: true` no `next.config.ts` é o que liga tudo isso. Ele já
estava habilitado antes deste documento; o que faltava era usá-lo com critério.

## As três categorias de renderização

Todo componente cai em uma destas. Saber em qual é o que evita tanto página
lenta quanto dado desatualizado:

1. **Estático** — código síncrono, sem `await` de dado de request.
   Prerenderizado no build, servido pelo CDN. **É onde a maior parte deste
   projeto já está**: `/`, `/docs`, os widgets e gráficos do dashboard. Não
   precisa de diretiva; adicionar cache aqui só piora.
2. **Cacheado** — função `async` com uma das diretivas abaixo.
3. **Dinâmico** — leu `cookies()`, `headers()` ou `searchParams`. Precisa estar
   dentro de `<Suspense>`, senão o build falha.

No output do `pnpm build`, `○` é estático, `◐` é PPR (shell estático + trecho
dinâmico via streaming) e `ƒ` é dinâmico por request.

## Qual diretiva usar

| Diretiva               | Onde vive            | Use para                        |
| ---------------------- | -------------------- | ------------------------------- |
| `'use cache'`          | Memória da instância | Conteúdo do shell estático      |
| `'use cache: remote'`  | Runtime Cache Vercel | Dado **compartilhado** e caro   |
| `'use cache: private'` | Memória do browser   | Dado por-usuário (experimental) |

### `'use cache'`

Padrão. Vive na memória da instância que serviu o request. Em ambiente
serverless isso significa taxa de acerto baixa fora do shell estático — cada
instância tem a própria memória, geralmente descartada após o request.

Vale para conteúdo que compõe o shell estático. É o caso do rodapé:

```tsx
// src/components/layout/footer.tsx
export async function Footer() {
  'use cache'
  cacheLife(CACHE_PROFILES.chrome)
  cacheTag(cacheTags.chrome)

  const year = new Date().getFullYear()
  // ...
}
```

O `new Date()` aqui é o motivo original da diretiva: sem ela, ler a hora atual
quebra o prerender estático. Dentro do escopo cacheado, o ano é avaliado uma
vez e congelado pelo tempo do perfil.

### `'use cache: remote'` (Runtime Cache da Vercel)

Grava no Runtime Cache da Vercel: persistente entre deploys, **compartilhado
entre todas as instâncias e todos os visitantes** da região. Custa uma ida à
rede na leitura, então só compensa quando o cache evita algo pior.

Use quando:

- o upstream tem rate limit ou é instável;
- a query/computação é cara e o banco vira gargalo sob tráfego;
- o dado é o mesmo para muita gente.

```ts
// `cacheTags.metricas` não existe ainda: adicione a tag em `lib/cache.ts`
// junto com a feature que a usa.
async function getMetricasGlobais() {
  'use cache: remote'
  cacheTag(cacheTags.metricas)
  cacheLife(CACHE_PROFILES.sharedData)

  return db.select(/* agregação cara */)
}
```

> **A regra que mais se erra:** nunca coloque dado de um usuário só no
> `'use cache: remote'`. Cada usuário viraria uma entrada distinta — taxa de
> acerto perto de zero, pagando armazenamento à toa — e qualquer erro na chave
> de cache vira **vazamento de dado entre contas**.
>
> A saída é cachear pela dimensão de **poucos valores distintos**. Em vez de
> `getPerfil(userId)` (milhares de entradas), cacheie `getConteudo(idioma)`
> (~10 entradas) e escolha o idioma a partir da sessão.

### `'use cache: private'`

Permite ler `cookies()`/`headers()` dentro do escopo cacheado, mas o resultado
**nunca é gravado no servidor**: vive só na memória do browser e não sobrevive
a um reload. É marcada como **experimental** no Next.js 16.

Só recorra a ela se refatorar (extrair o dado de request e passar como
argumento) não for prático, ou se houver exigência de compliance que proíba
guardar aquele dado no servidor.

## Por que a lista de tarefas não é cacheada

Decisão consciente, não esquecimento.

`taskRepository.findManyByUser` é o único dado real do projeto, e ele é:

- **por-usuário** — o anti-padrão explícito do `'use cache: remote'`;
- **mutável a cada ação** — criar, editar ou remover invalidaria na hora;
- **barato** — uma query indexada por `userId` no Neon.

Cachear ali seria custo de infraestrutura e superfície de vazamento em troca de
ganho irrelevante. A recomendação da própria Vercel para dado de usuário é
buscar direto na fonte. É o que fazemos.

Se a sua aplicação crescer para algo genuinamente caro e compartilhado —
métricas agregadas, catálogo público, resposta de API de terceiro — é aí que
`'use cache: remote'` entra, seguindo o padrão da seção anterior.

## Perfis e tags

Ambos centralizados em `src/lib/cache.ts`.

**Perfis** (`CACHE_PROFILES`) são nomeados por intenção, não por duração, para
que o call site diga o porquê. Ajuste os números num lugar só:

| Perfil        | `stale` | `revalidate` | `expire` | Para                             |
| ------------- | ------- | ------------ | -------- | -------------------------------- |
| `chrome`      | 1 h     | 1 d          | 1 sem    | Rodapé, navegação, institucional |
| `sharedData`  | 1 min   | 5 min        | 1 h      | Dado compartilhado do banco      |
| `externalApi` | 5 min   | 1 h          | 1 d      | Upstream com rate limit          |

**Tags** (`cacheTags`) evitam string literal espalhada: um typo numa tag não
quebra o build, só faz a invalidação silenciosamente não acontecer. Hoje só
existe `chrome` (usada pelo rodapé) — ao criar uma feature com leitura
compartilhada, adicione a tag dela ali.

## Invalidação

Marque a leitura com `cacheTag(...)` e invalide na Server Action:

```ts
'use server'
import { updateTag } from 'next/cache'
import { cacheTags } from '@/lib/cache'

export const atualizarAction = authAction(schema, async (input, { user }) => {
  const resultado = await meuService.atualizar(user.id, input)
  updateTag(cacheTags.metricas)
  return resultado
})
```

- **`updateTag(tag)`** — imediato: o mesmo request já lê o valor novo
  (read-your-own-writes). Só funciona em Server Action.
- **`revalidateTag(tag, 'max')`** — stale-while-revalidate: serve o valor
  antigo enquanto atualiza em background. Note que a forma de um argumento só
  está depreciada no Next.js 16 — sempre passe o segundo argumento.

**Prefira tag a `revalidatePath`.** O path derruba a rota inteira, inclusive o
shell estático que não mudou. As actions de tarefas ainda usam `revalidatePath`
porque, sem leitura cacheada, não há tag para invalidar — é o correto aqui.

## Verificando

O `pnpm build` imprime as colunas `Revalidate` e `Expire` por rota. Depois de
aplicar o perfil `chrome` no rodapé, `/` e `/docs` passaram de `15m` (padrão)
para `1d / 1w`, confirmando que o perfil propaga pelo layout público.

Em produção, o painel da Vercel em **Observability → Runtime Cache** mostra
taxa de acerto e uso de armazenamento. Taxa de acerto baixa num
`'use cache: remote'` quase sempre significa chave de cache específica demais —
releia a regra acima.

## Referências

- [Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)
- [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [`use cache: remote`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote)
- [Vercel Runtime Cache](https://vercel.com/docs/runtime-cache)
