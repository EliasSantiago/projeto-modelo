import { cacheLife, cacheTag } from 'next/cache'
import { APP } from '@/constants/app'
import { CACHE_PROFILES, cacheTags } from '@/lib/cache'

/**
 * Cached (Cache Components): o ano é avaliado uma vez no momento do cache,
 * evitando a restrição de "current time" durante o prerender estático.
 *
 * Usa `'use cache'` (memória da instância), não `'use cache: remote'`: o
 * rodapé faz parte do shell estático, já sai prerenderizado no CDN e não custa
 * nada para recalcular. Pagar ida ao Runtime Cache aqui só adicionaria
 * latência. Ver `lib/cache.ts` para o critério de escolha entre as diretivas.
 */
export async function Footer() {
  'use cache'
  cacheLife(CACHE_PROFILES.chrome)
  cacheTag(cacheTags.chrome)

  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-[var(--color-muted-foreground)]">
        © {year} {APP.name}. Projeto modelo Next.js.
      </div>
    </footer>
  )
}
