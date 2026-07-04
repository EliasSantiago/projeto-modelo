import type { Metadata } from 'next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DataTable } from '@/features/admin/data-table'
import { tableRows } from '@/features/admin/mock-data'

export const metadata: Metadata = { title: 'Data Tables' }

export default function TablesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Projetos</CardTitle>
          <CardDescription>
            Tabela boilerplate com ordenação e paginação no cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable rows={tableRows} />
        </CardContent>
      </Card>
    </div>
  )
}
