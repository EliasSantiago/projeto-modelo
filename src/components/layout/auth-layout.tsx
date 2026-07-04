import Link from 'next/link'
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'

/**
 * Layout de autenticação split-screen: formulário à esquerda, painel com
 * gradiente roxo e canto arredondado à direita.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark:bg-navy-900 relative flex min-h-dvh w-full bg-white">
      {/* Coluna do formulário */}
      <div className="flex w-full flex-col px-6 sm:px-10 lg:w-[55%] lg:px-16 xl:px-24">
        <div className="flex items-center justify-between py-6">
          <Link
            href={ROUTES.home}
            className="text-navy-700 hover:text-brand-500 dark:text-navy-100 flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeftIcon className="size-4" aria-hidden />
            Voltar ao início
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      {/* Painel decorativo (gradiente roxo com canto arredondado) */}
      <div className="relative hidden lg:block lg:w-[45%]">
        <div className="from-brand-400 to-brand-600 fixed top-0 right-0 flex h-full w-[45%] flex-col items-center justify-center overflow-hidden bg-gradient-to-br lg:rounded-bl-[120px] xl:rounded-bl-[200px]">
          {/* Bolhas decorativas */}
          <div className="absolute -top-24 -left-24 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="bg-brand-900/20 absolute right-0 bottom-0 size-80 rounded-full blur-3xl" />

          <div className="relative z-10 flex max-w-sm flex-col items-center px-8 text-center text-white">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <SparklesIcon className="size-8" aria-hidden />
            </div>
            <h2 className="text-3xl font-bold">{APP.name}</h2>
            <p className="mt-3 text-base text-white/80">{APP.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
