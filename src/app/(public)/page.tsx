import Link from 'next/link'
import {
  ArrowRightIcon,
  BoltIcon,
  BookOpenIcon,
  LockClosedIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageCard } from '@/features/marketing/page-card'
import { SITE_PAGES } from '@/constants/site-pages'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'

const features = [
  {
    icon: LockClosedIcon,
    title: 'Seguro por padrão',
    description:
      'Auth.js v5 (e-mail/senha + OAuth), validação com Zod e OWASP Top 10.',
  },
  {
    icon: Squares2X2Icon,
    title: 'Arquitetura em camadas',
    description:
      'app · features · services · repositories · db, num sentido só.',
  },
  {
    icon: BoltIcon,
    title: 'Pronto para produção',
    description: 'Next.js 16, RSC, Server Actions, Drizzle + Neon e Vercel.',
  },
]

const techBadges = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'Tailwind v4',
  'Auth.js',
  'Drizzle',
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center">
          <h1 className="text-ink text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Construa produtos rápido, com{' '}
            <span className="from-ink to-ink-3 bg-gradient-to-r bg-clip-text text-transparent">
              segurança e escala
            </span>
          </h1>

          <p className="text-ink-3 mx-auto mt-5 max-w-2xl text-lg text-pretty">
            {APP.description} Autenticação, banco, camadas, UI e telas prontas,
            do primeiro commit ao deploy.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={ROUTES.register}>Criar conta</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={ROUTES.docs}>
                <BookOpenIcon aria-hidden />
                Documentação
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {techBadges.map((tech) => (
              <span
                key={tech}
                className="bg-surface-3 text-ink-2 rounded-lg px-3 py-1 text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="p-6">
              <div className="bg-surface-3 text-accent flex size-12 items-center justify-center rounded-2xl">
                <Icon className="size-6" aria-hidden />
              </div>
              <h3 className="text-ink mt-4 font-semibold">{title}</h3>
              <p className="text-ink-3 mt-1 text-sm">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Explore as páginas */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-ink text-2xl font-semibold">
              Explore as páginas
            </h2>
            <p className="text-ink-3 mt-1">
              Telas prontas para usar. Veja todas na documentação.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href={ROUTES.docs}>
              Ver tudo
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SITE_PAGES.map((page) => (
            <PageCard key={page.href} page={page} />
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="surface-graphite relative overflow-hidden rounded-[var(--radius-xl)] px-8 py-14 text-center">
          <div
            className="absolute -top-20 -right-16 size-64 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <h2 className="relative text-3xl font-semibold">
            Pronto para começar?
          </h2>
          <p className="text-ink-2 relative mx-auto mt-2 max-w-lg">
            Crie sua conta e explore o dashboard, ou leia a documentação para
            rodar localmente.
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={ROUTES.register}>Criar conta grátis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-line-strong text-ink hover:bg-surface-3 bg-transparent"
            >
              <Link href={ROUTES.docs}>Ler a documentação</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
