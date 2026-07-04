import Link from 'next/link'
import {
  BoltIcon,
  LockClosedIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { APP } from '@/constants/app'
import { ROUTES } from '@/constants/routes'

const features = [
  {
    icon: LockClosedIcon,
    title: 'Seguro por padrão',
    description:
      'Auth.js v5, validação com Zod e camadas isoladas seguindo o OWASP Top 10.',
  },
  {
    icon: Squares2X2Icon,
    title: 'Arquitetura em camadas',
    description:
      'app · features · services · repositories · db, com dependências num sentido só.',
  },
  {
    icon: BoltIcon,
    title: 'Pronto para produção',
    description:
      'Next.js 16, RSC, Server Actions, Drizzle + Neon e deploy na Vercel.',
  },
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="flex flex-col items-center gap-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          {APP.name}
        </h1>
        <p className="max-w-2xl text-lg text-pretty text-[var(--color-muted-foreground)]">
          {APP.description}
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href={ROUTES.login}>Começar</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={ROUTES.dashboard}>Ver dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 pb-24 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon
                className="size-6 text-[var(--color-primary)]"
                aria-hidden
              />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </div>
  )
}
