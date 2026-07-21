import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` em script-src é necessário porque o Next injeta scripts
 * inline de bootstrap/hidratação. A alternativa correta é CSP por nonce, que
 * exige gerar o nonce no `proxy.ts` e força render dinâmico em toda página,
 * anulando o Cache Components/PPR deste projeto. A troca está documentada
 * aqui de propósito: esta CSP mitiga injeção de recurso externo, não XSS
 * inline. Para um produto que manipule dado sensível, migre para nonce.
 *
 * `'unsafe-eval'` fica só em desenvolvimento, onde o Fast Refresh precisa.
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Tailwind e o next/font emitem style inline.
  `style-src 'self' 'unsafe-inline'`,
  // Avatares dos provedores OAuth + imagens otimizadas do next/image.
  `img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com`,
  `font-src 'self' data:`,
  // Em dev o HMR usa websocket.
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Defesa em profundidade junto de frame-ancestors (navegadores antigos).
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // HSTS só faz sentido sob HTTPS; em dev (http://localhost) atrapalha.
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),
]

const nextConfig: NextConfig = {
  // Partial Prerendering / Cache Components (Next.js 16+).
  cacheComponents: true,
  // Falha o build de produção em erros de tipo, qualidade é um gate.
  typescript: { ignoreBuildErrors: false },
  // Não anunciar o framework reduz alvo fácil de fingerprinting.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Avatares dos provedores OAuth usados na sessão.
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
