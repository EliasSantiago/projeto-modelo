'use client'

import { useMemo, useState } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import type { TableRow } from '@/features/admin/mock-data'
import { cn } from '@/lib/utils'

type SortKey = keyof TableRow
const PAGE_SIZE = 5

const statusStyles: Record<TableRow['status'], string> = {
  Aprovado:
    'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  Pendente:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Erro: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
}

export function DataTable({ rows }: { rows: TableRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [asc, setAsc] = useState(true)
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return asc ? cmp : -cmp
    })
  }, [rows, sortKey, asc])

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE)
  const paged = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((v) => !v)
    else {
      setSortKey(key)
      setAsc(true)
    }
    setPage(0)
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Nome' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Data' },
    { key: 'progress', label: 'Progresso' },
  ]

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-navy-400 pr-4 pb-3 font-medium"
                >
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1 tracking-wide uppercase"
                  >
                    {col.label}
                    <ChevronUpDownIcon className="size-4" aria-hidden />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr
                key={row.name}
                className="border-b border-[var(--color-border)] last:border-0"
              >
                <td className="text-navy-700 py-4 pr-4 font-bold dark:text-white">
                  {row.name}
                </td>
                <td className="py-4 pr-4">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium',
                      statusStyles[row.status],
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="text-navy-500 dark:text-navy-100 py-4 pr-4">
                  {row.date}
                </td>
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--color-muted)]">
                      <div
                        className="bg-brand-500 h-full rounded-full"
                        style={{ width: `${row.progress}%` }}
                      />
                    </div>
                    <span className="text-navy-400 text-xs">
                      {row.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-navy-400 text-sm">
          Página {page + 1} de {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  )
}
