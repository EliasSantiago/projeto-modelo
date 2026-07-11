import type { MetadataRoute } from 'next'
import { APP } from '@/constants/app'

/**
 * Regras para crawlers. As rotas de exemplo do dashboard e as telas de
 * autenticação não têm valor de indexação — bloqueadas para não poluir SERPs.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
      ],
    },
    sitemap: new URL('/sitemap.xml', APP.url).toString(),
    host: APP.url,
  }
}
