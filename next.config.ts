import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Partial Prerendering / Cache Components (Next.js 16+).
  cacheComponents: true,
  // Falha o build de produção em erros de tipo — qualidade é um gate.
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [
      // Avatares dos provedores OAuth usados na sessão.
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default nextConfig
