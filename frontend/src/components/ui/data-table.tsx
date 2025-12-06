import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

/**
 * Data Table - Tabela com sorting, hover row, responsiva
 * Baseado no componente do 21st.dev
 * Customizado para tema roxo Let's Roll
 */
export interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  className?: string
  onRowClick?: (row: T) => void
}

type SortDirection = "asc" | "desc" | null

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection(null)
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data

    const column = columns.find((col) => col.id === sortColumn)
    if (!column || !column.accessorKey) return data

    return [...data].sort((a, b) => {
      const aValue = a[column.accessorKey!]
      const bValue = b[column.accessorKey!]

      if (aValue === bValue) return 0

      const comparison = aValue < bValue ? -1 : 1
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection, columns])

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#8000FF]/20">
            {columns.map((column) => (
              <th
                key={column.id}
                className={cn(
                  "px-4 py-3 text-left text-sm font-semibold text-[#8000FF]",
                  column.sortable && "cursor-pointer select-none hover:bg-[#8000FF]/10",
                  "transition-colors"
                )}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <span className="text-[#8000FF]">
                      {sortColumn === column.id ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "border-b border-[#8000FF]/10 transition-colors",
                onRowClick && "cursor-pointer",
                "hover:bg-[#2A2A3A]"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td key={column.id} className="px-4 py-3 text-sm text-white">
                  {column.cell
                    ? column.cell(row)
                    : column.accessorKey
                    ? String(row[column.accessorKey] ?? "")
                    : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-[#A0A0A0]">
          Nenhum dado encontrado
        </div>
      )}
    </div>
  )
}

