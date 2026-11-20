import type { ComponentType, SVGProps } from 'react'
import { Card } from '@/components/ui/card'

type StatWidgetProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: string | number
}

/** Card de métrica: pílula com ícone + rótulo/valor. */
export function StatWidget({ icon: Icon, label, value }: StatWidgetProps) {
  return (
    <Card className="flex flex-row items-center gap-4 p-4">
      <div className="bg-accent-soft text-accent-soft-ink flex size-12 items-center justify-center rounded-full">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="flex flex-col">
        <span className="text-ink-3 text-[13px] font-medium">{label}</span>
        <span className="text-ink tabular text-xl font-semibold tracking-tight">
          {value}
        </span>
      </div>
    </Card>
  )
}
