import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Perfil' }

const stats = [
  { label: 'Projetos', value: '17' },
  { label: 'Seguidores', value: '9.7k' },
  { label: 'Seguindo', value: '274' },
]

const generalInfo = [
  { label: 'Cargo', value: 'Full-Stack Developer' },
  { label: 'Localização', value: 'Brasil' },
  { label: 'Plano', value: 'Pro' },
  { label: 'Idioma', value: 'Português' },
]

export default async function ProfilePage() {
  const user = await getCurrentUser()
  const displayName = user?.name ?? user?.email ?? 'Visitante'
  const email = user?.email ?? 'visitante@exemplo.com'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho do perfil */}
      <Card className="overflow-hidden">
        <div className="surface-graphite h-40" />
        <div className="-mt-12 flex flex-col items-center pb-6">
          <div className="bg-accent-soft text-accent-soft-ink border-surface flex size-24 items-center justify-center rounded-full border-4 text-2xl font-semibold">
            {initials}
          </div>
          <h1 className="text-ink mt-3 text-xl font-semibold">{displayName}</h1>
          <p className="text-ink-3 text-sm">{email}</p>

          <div className="mt-6 flex gap-10">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-ink text-2xl font-semibold">
                  {s.value}
                </span>
                <span className="text-ink-3 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações gerais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {generalInfo.map((info) => (
              <div key={info.label} className="bg-surface-3 rounded-xl p-4">
                <p className="text-ink-3 text-xs">{info.label}</p>
                <p className="text-ink font-medium">{info.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ink-2 text-sm">
              Esta é uma página de perfil boilerplate. Os dados de nome e e-mail
              vêm da sessão real do Auth.js; os demais campos são fictícios e
              podem ser ligados aos seus dados quando a feature de perfil for
              implementada.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
