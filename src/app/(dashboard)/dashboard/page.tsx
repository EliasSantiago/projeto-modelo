import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  BanknotesIcon,
  CreditCardIcon,
  RectangleStackIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { AreaChart } from '@/components/charts/area-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { StatWidget } from '@/components/ui/stat-widget'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TaskSection } from '@/features/tasks/task-section'
import {
  dashboardWidgets,
  revenueLabels,
  revenueSeries,
  weeklyLabels,
  weeklySeries,
} from '@/features/admin/mock-data'

export const metadata: Metadata = { title: 'Main Dashboard' }

const widgetIcons = [
  BanknotesIcon,
  CreditCardIcon,
  UsersIcon,
  RectangleStackIcon,
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Widgets de métricas (boilerplate) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardWidgets.map((w, i) => (
          <StatWidget
            key={w.label}
            icon={widgetIcons[i]!}
            label={w.label}
            value={w.value}
          />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardDescription>Receita anual</CardDescription>
            <CardTitle className="text-2xl">R$ 34.500</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <AreaChart
              data={revenueSeries}
              labels={revenueLabels}
              prefix="R$ "
              suffix=" mil"
            />
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0">
            <CardDescription>Atividade semanal</CardDescription>
            <CardTitle className="text-2xl">+18%</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <BarChart
              data={weeklySeries}
              labels={weeklyLabels}
              suffix=" ações"
            />
          </CardContent>
        </Card>
      </div>

      {/* Feature de tarefas: real quando logado, demo estático para visitantes */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas tarefas</CardTitle>
          <CardDescription>
            Feature funcional: criada, atualizada e removida via Server Actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="h-24 animate-pulse rounded-xl bg-[var(--color-muted)]" />
            }
          >
            <TaskSection />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
