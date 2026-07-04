import type { Metadata } from 'next'
import { HeartIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { nftItems } from '@/features/admin/mock-data'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Marketplace' }

export default function MarketplacePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Banner */}
      <div className="from-brand-400 to-brand-600 relative overflow-hidden rounded-[24px] bg-gradient-to-br p-10 text-white">
        <div className="absolute -top-16 -right-10 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-lg">
          <h1 className="text-3xl font-bold">
            Descubra, colecione e venda NFTs
          </h1>
          <p className="mt-2 text-white/80">
            Marketplace boilerplate — grade de cards pronta para receber seus
            dados reais.
          </p>
          <Button className="text-brand-600 mt-6 bg-white hover:bg-white/90">
            Explorar
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-navy-700 mb-4 text-xl font-bold dark:text-white">
          Em destaque
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {nftItems.map((item) => (
            <Card key={item.id} className="flex flex-col gap-4 p-4">
              <div
                className={cn(
                  'relative flex aspect-[4/3] items-end justify-end rounded-2xl bg-gradient-to-br p-3',
                  item.gradient,
                )}
              >
                <button
                  aria-label="Favoritar"
                  className="flex size-9 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur"
                >
                  <HeartIcon className="size-5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-700 font-bold dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-navy-400 text-sm">por {item.author}</p>
                </div>
                <p className="text-brand-500 dark:text-brand-400 text-sm font-bold">
                  {item.price}
                </p>
              </div>

              <Button size="sm" className="w-full">
                Comprar
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
