import { useEffect, useState } from 'react'
import { History, Search, ArrowRight, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { movesApi, type MoveHistoryItem } from '../api/client'

export function MoveHistoryPage() {
  const [moves, setMoves] = useState<MoveHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [moveTypeFilter, setMoveTypeFilter] = useState('All')
  const [search, setSearch] = useState('')

  function fetchMoves() {
    setLoading(true)
    movesApi
      .list({
        move_type: moveTypeFilter !== 'All' ? moveTypeFilter : undefined,
        search: search || undefined,
      })
      .then(setMoves)
      .catch((err) => console.error('Failed to fetch moves', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMoves()
  }, [moveTypeFilter])

  const columns = [
    {
      key: 'date',
      header: 'Date & Time',
      cell: (m: MoveHistoryItem) => {
        const d = new Date(m.date)
        return (
          <div>
            <p className="font-medium text-slate-800 text-xs">
              {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-[10px] text-gray-400 font-mono">
              {d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )
      },
    },
    {
      key: 'reference',
      header: 'Reference',
      cell: (m: MoveHistoryItem) => (
        <span className="font-mono font-semibold text-slate-900 text-xs">
          {m.reference}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (m: MoveHistoryItem) => {
        if (m.move_type === 'in') {
          return (
            <Badge variant="success" className="gap-1">
              <ArrowDownRight size={12} /> Inbound
            </Badge>
          )
        }
        if (m.move_type === 'out') {
          return (
            <Badge variant="warning" className="gap-1">
              <ArrowUpRight size={12} /> Outbound
            </Badge>
          )
        }
        if (m.move_type === 'transfer') {
          return (
            <Badge variant="default" className="gap-1">
              <RefreshCw size={11} /> Transfer
            </Badge>
          )
        }
        return (
          <Badge variant="neutral" className="gap-1">
            Adjustment
          </Badge>
        )
      },
    },
    {
      key: 'product',
      header: 'Product',
      cell: (m: MoveHistoryItem) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{m.product_name || 'Product'}</p>
          <p className="text-[10px] font-mono text-gray-400">{m.product_sku}</p>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      className: 'text-right',
      cell: (m: MoveHistoryItem) => {
        return (
          <span
            className={`font-mono font-bold text-xs ${m.move_type === 'in'
              ? 'text-emerald-600'
              : m.move_type === 'out'
                ? 'text-amber-600'
                : 'text-slate-900'
              }`}
          >
            {m.move_type === 'in' ? '+' : m.move_type === 'out' ? '-' : ''}
            {m.quantity}
          </span>
        )
      },
    },
    {
      key: 'locations',
      header: 'From → To Location',
      cell: (m: MoveHistoryItem) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span>{m.from_location_name || 'Vendors'}</span>
          <ArrowRight size={12} className="text-gray-400" />
          <span className="font-medium text-slate-800">
            {m.to_location_name || 'Customers'}
          </span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact / Audit Note',
      cell: (m: MoveHistoryItem) => (
        <span className="text-xs text-gray-500 truncate max-w-[200px] block">
          {m.contact_name || m.reason || '—'}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Move History"
        description="Immutable audit trail of all physical inventory transactions and quantity modifications."
      />

      {/* Filter and Search */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchMoves() }} className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, product, or note…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-1.5">
          {[
            { label: 'All Moves', value: 'All' },
            { label: 'Inbound', value: 'in' },
            { label: 'Outbound', value: 'out' },
            { label: 'Transfers', value: 'transfer' },
            { label: 'Adjustments', value: 'adjustment' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setMoveTypeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${moveTypeFilter === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        {moves.length === 0 && !loading ? (
          <EmptyState
            icon={History}
            title="No move history entries"
            description="All validated receipts, deliveries, transfers, and adjustments will be recorded here automatically."
          />
        ) : (
          <Table
            columns={columns}
            data={moves}
            keyExtractor={(m) => m.id}
            loading={loading}
          />
        )}
      </Card>
    </>
  )
}
