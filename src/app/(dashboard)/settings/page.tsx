import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSelector } from '@/components/layout/theme-selector'

export const metadata: Metadata = { title: 'Configurações' }

type Row = { label: string; value?: string; control?: ReactNode }

const accountRows: Row[] = [
  { label: 'Nome de exibição', value: 'Definido pela sessão' },
  { label: 'E-mail', value: 'Definido pela sessão' },
  { label: 'Senha', value: '••••••••' },
]

const preferenceRows: Row[] = [
  { label: 'Tema', control: <ThemeSelector /> },
  { label: 'Idioma', value: 'Português' },
  { label: 'Notificações', value: 'Ativadas' },
]

function SettingsRow({ label, value, control }: Row) {
  return (
    <div className="flex min-h-10 items-center justify-between border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
      <span className="text-navy-400 text-sm">{label}</span>
      {control ?? (
        <span className="text-navy-700 text-sm font-medium dark:text-white">
          {value}
        </span>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {accountRows.map((row) => (
            <SettingsRow key={row.label} {...row} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {preferenceRows.map((row) => (
            <SettingsRow key={row.label} {...row} />
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-navy-500 dark:text-navy-100 text-sm">
            Página de configurações boilerplate. Os campos são ilustrativos e
            podem ser ligados aos seus dados e Server Actions quando a feature
            de configurações for implementada.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
