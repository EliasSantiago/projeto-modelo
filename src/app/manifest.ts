import type { MetadataRoute } from 'next'
import { APP } from '@/constants/app'

/** Web App Manifest (PWA básico). Cores alinhadas ao tema grafite. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP.name,
    short_name: APP.name,
    description: APP.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#27272a',
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
  }
}
