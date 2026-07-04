import Link from 'next/link'
import { ArrowUpRightIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/card'
import type { SitePage } from '@/constants/site-pages'

/** Card de navegação para uma página do projeto (docs + home). */
export function PageCard({ page }: { page: SitePage }) {
  const { title, description, href, access, icon: Icon } = page
  return (
    <Link href={href} className="group">
      <Card className="flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
        <div className="flex items-center justify-between">
          <div className="bg-light-primary text-brand-500 dark:bg-navy-700 flex size-11 items-center justify-center rounded-xl dark:text-white">
            <Icon className="size-6" aria-hidden />
          </div>
          <ArrowUpRightIcon
            className="text-navy-300 group-hover:text-brand-500 size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-white"
            aria-hidden
          />
        </div>
        <div>
          <h3 className="text-navy-700 font-bold dark:text-white">{title}</h3>
          <p className="text-navy-400 mt-1 text-sm">{description}</p>
        </div>
        <div className="mt-auto">
          {access === 'auth' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              <LockClosedIcon className="size-3" aria-hidden />
              Requer login
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/15 dark:text-green-400">
              Pública
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}
