import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Wordmark } from '@/components/layout/logo'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'

/**
 * Layout de autenticação: um único cartão com o formulário, centralizado na
 * tela. Marca no topo, alternância de tema no canto, rodapé discreto.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg flex min-h-dvh w-full flex-col">
      <div className="flex justify-end px-4 py-4 sm:px-6">
        <ThemeToggle />
      </div>

      <main
        id="conteudo"
        className="flex flex-1 flex-col items-center justify-center px-4 pb-10"
      >
        <Link
          href={ROUTES.home}
          aria-label={`${APP.name}, ir para o início`}
          className="mb-8"
        >
          <Wordmark />
        </Link>

        <div className="border-line surface-card shadow-pop w-full max-w-[26rem] rounded-[var(--radius-lg)] border px-6 py-8 sm:px-9 sm:py-10">
          {children}
        </div>
      </main>

      <p className="text-ink-3 pb-6 text-center text-xs">© {APP.name}</p>
    </div>
  )
}
