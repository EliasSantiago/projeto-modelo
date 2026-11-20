import type { Metadata } from 'next'
import { HeartIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { nftItems } from '@/features/admin/mock-data'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Marketplace' }

export default function MarketplacePage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="surface-graphite relative overflow-hidden rounded-[var(--radius-lg)] p-10">
        <div className="absolute -top-16 -right-10 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-lg">
          <h1 className="text-3xl font-semibold">
            Descubra, colecione e venda NFTs
          </h1>
          <p className="text-ink-2 mt-2">
            Marketplace boilerplate, grade de cards pronta para receber seus
            dados reais.
          </p>
          <Button className="mt-6">Explorar</Button>
        </div>
      </div>

      <div>
        <h2 className="text-ink mb-4 text-xl font-semibold">Em destaque</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                  className="flex size-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur"
                >
                  <HeartIcon className="size-5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ink font-semibold">{item.title}</p>
                  <p className="text-ink-3 text-sm">por {item.author}</p>
                </div>
                <p className="text-accent text-sm font-semibold">
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
