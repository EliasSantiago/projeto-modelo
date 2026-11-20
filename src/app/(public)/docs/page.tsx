import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpenIcon,
  CommandLineIcon,
  KeyIcon,
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/card'
import { PageCard } from '@/features/marketing/page-card'
import { PAGE_CATEGORIES, SITE_PAGES } from '@/constants/site-pages'
import { APP } from '@/constants/app'

export const metadata: Metadata = {
  title: 'Documentação',
  description: 'Guia de instalação e índice de páginas do projeto modelo.',
}

const installSteps = `# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local

# 3. Aplicar o schema no banco (Neon)
pnpm db:generate && pnpm db:migrate && pnpm db:seed

# 4. Rodar em desenvolvimento
pnpm dev`

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Cabeçalho */}
      <div className="text-accent flex items-center gap-2 text-sm font-medium">
        <BookOpenIcon className="size-5" aria-hidden />
        Documentação
      </div>
      <h1 className="text-ink mt-3 text-4xl font-semibold">
        Comece com o {APP.name}
      </h1>
      <p className="text-ink-3 mt-3 max-w-2xl text-lg">
        Um starter Next.js seguro e escalável. Abaixo você encontra a instalação
        rápida, como acessar cada página e o índice completo de telas.
      </p>

      {/* Início rápido */}
      <section className="mt-12">
        <h2 className="text-ink flex items-center gap-2 text-xl font-semibold">
          <CommandLineIcon className="text-accent size-6" aria-hidden />
          Início rápido
        </h2>
        <Card className="mt-4 overflow-hidden">
          <pre className="surface-graphite text-ink-2 overflow-x-auto p-5 text-sm leading-relaxed">
            <code>{installSteps}</code>
          </pre>
        </Card>
      </section>

      {/* Como acessar */}
      <section className="mt-12">
        <h2 className="text-ink flex items-center gap-2 text-xl font-semibold">
          <KeyIcon className="text-accent size-6" aria-hidden />
          Como acessar as páginas
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-ink font-semibold">
              Tudo aberto para visualização
            </h3>
            <p className="text-ink-3 mt-1 text-sm">
              As telas de exemplo (dashboard, tabelas, marketplace, perfil) são
              públicas, abrem direto, sem login, para servir de documentação.
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="text-ink font-semibold">
              Recursos reais (opcional)
            </h3>
            <p className="text-ink-3 mt-1 text-sm">
              A feature de tarefas funciona de verdade quando você entra. Após{' '}
              <code className="bg-surface-3 rounded px-1">pnpm db:seed</code>,
              use <strong className="text-ink">demo@example.com</strong> com a
              senha que o seed mostra no terminal.
            </p>
          </Card>
        </div>
      </section>

      {/* Índice de páginas */}
      <section className="mt-12">
        <h2 className="text-ink text-xl font-semibold">Índice de páginas</h2>
        {PAGE_CATEGORIES.map((category) => (
          <div key={category} className="mt-6">
            <h3 className="text-ink-3 mb-3 text-sm font-semibold tracking-wide uppercase">
              {category}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SITE_PAGES.filter((p) => p.category === category).map((page) => (
                <PageCard key={page.href} page={page} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="text-ink-3 mt-12 text-sm">
        Precisa de mais detalhes? Veja o{' '}
        <Link
          href="https://github.com/EliasSantiago/projeto-modelo"
          className="text-accent hover:text-ink font-medium"
        >
          README no repositório
        </Link>
        .
      </div>
    </div>
  )
}
