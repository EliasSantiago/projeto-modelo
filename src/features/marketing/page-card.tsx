import Link from 'next/link'
import { ArrowUpRightIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/card'
import type { SitePage } from '@/constants/site-pages'

/** Card de navegação para uma página do projeto (docs + home). */
export function PageCard({ page }: { page: SitePage }) {
  const { title, description, href, access, icon: Icon } = page
  return (
    <Link href={href} className="group">
      <Card className="hover:shadow-pop flex h-full flex-col gap-3 p-5 transition-shadow">
        <div className="flex items-center justify-between">
          <div className="bg-surface-3 text-accent flex size-11 items-center justify-center rounded-xl">
            <Icon className="size-6" aria-hidden />
          </div>
          <ArrowUpRightIcon
            className="text-ink-3 group-hover:text-ink size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </div>
        <div>
          <h3 className="text-ink font-semibold">{title}</h3>
          <p className="text-ink-3 mt-1 text-sm">{description}</p>
        </div>
        <div className="mt-auto">
          {access === 'auth' ? (
            <span className="bg-warning-soft text-warning inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
              <LockClosedIcon className="size-3" aria-hidden />
              Requer login
            </span>
          ) : (
            <span className="bg-success-soft text-success inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
              Pública
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}
