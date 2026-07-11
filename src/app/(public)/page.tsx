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
          <h1 className="text-navy-700 text-5xl font-bold tracking-tight text-balance sm:text-6xl dark:text-white">
            Construa produtos rápido, com{' '}
            <span className="from-navy-600 to-navy-400 dark:to-navy-200 bg-gradient-to-r bg-clip-text text-transparent dark:from-white">
              segurança e escala
            </span>
          </h1>

          <p className="text-navy-400 mx-auto mt-5 max-w-2xl text-lg text-pretty">
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
                className="bg-light-primary text-navy-500 dark:bg-navy-800 dark:text-navy-100 rounded-lg px-3 py-1 text-xs font-medium"
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
              <div className="bg-light-primary text-brand-500 dark:bg-navy-700 flex size-12 items-center justify-center rounded-2xl dark:text-white">
                <Icon className="size-6" aria-hidden />
              </div>
              <h3 className="text-navy-700 mt-4 font-bold dark:text-white">
                {title}
              </h3>
              <p className="text-navy-400 mt-1 text-sm">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Explore as páginas */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-navy-700 text-2xl font-bold dark:text-white">
              Explore as páginas
            </h2>
            <p className="text-navy-400 mt-1">
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
        <div className="from-brand-500 to-brand-700 relative overflow-hidden rounded-[28px] bg-gradient-to-br px-8 py-14 text-center text-white">
          <div
            className="absolute -top-20 -right-16 size-64 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <h2 className="relative text-3xl font-bold">Pronto para começar?</h2>
          <p className="relative mx-auto mt-2 max-w-lg text-white/80">
            Crie sua conta e explore o dashboard, ou leia a documentação para
            rodar localmente.
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="text-brand-600 bg-white hover:bg-white/90"
            >
              <Link href={ROUTES.register}>Criar conta grátis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href={ROUTES.docs}>Ler a documentação</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
