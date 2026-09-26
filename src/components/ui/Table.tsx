import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'

interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T, index: number) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T, index: number) => string | number
  emptyMessage?: string
  loading?: boolean
  className?: string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available.',
  className = '',
}: TableProps<T>) {
  return (
    <div className={['w-full overflow-x-auto', className].join(' ')}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <Th key={col.key} className={col.className}>
                {col.header}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-sm text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={keyExtractor(row, i)}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100"
              >
                {columns.map((col) => (
                  <Td key={col.key} className={col.className}>
                    {col.cell(row, i)}
                  </Td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className = '', ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={[
        'px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </th>
  )
}

function Td({ children, className = '', ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={['px-4 py-3 text-gray-700', className].join(' ')}
      {...rest}
    >
      {children}
    </td>
  )
}
