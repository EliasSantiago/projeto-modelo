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
      <div className="bg-light-primary dark:bg-navy-700 flex size-14 items-center justify-center rounded-full">
        <Icon className="text-brand-500 size-6 dark:text-white" aria-hidden />
      </div>
      <div className="flex flex-col">
        <span className="text-navy-200 text-sm font-medium">{label}</span>
        <span className="text-navy-700 text-xl font-bold dark:text-white">
          {value}
        </span>
      </div>
    </Card>
  )
}
