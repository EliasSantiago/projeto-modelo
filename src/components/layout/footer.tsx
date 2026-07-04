import { APP } from '@/constants/app'

/**
 * Cached (Cache Components): o ano é avaliado uma vez no momento do cache,
 * evitando a restrição de "current time" durante o prerender estático.
 */
export async function Footer() {
  'use cache'
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-[var(--color-muted-foreground)]">
        © {year} {APP.name}. Projeto modelo Next.js.
      </div>
    </footer>
  )
}
