import type { MetadataRoute } from 'next'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'

/**
 * Sitemap com as rotas públicas indexáveis. As telas de auth e as páginas de
 * exemplo do dashboard ficam de fora (ver `robots.ts`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const indexable = [ROUTES.home, ROUTES.docs]

  return indexable.map((route) => ({
    url: new URL(route, APP.url).toString(),
    lastModified,
    changeFrequency: 'monthly',
    priority: route === ROUTES.home ? 1 : 0.8,
  }))
}
