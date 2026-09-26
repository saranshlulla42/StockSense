import { useEffect, useState } from 'react'
import { ArrowRightLeft, Plus, Search, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import {
  operationsApi,
  productsApi,
  warehousesApi,
  type Operation,
  type Product,
  type LocationItem,
  isApiError,
} from '../api/client'

export function TransfersPage() {
  const [transfers, setTransfers] = useState<Operation[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [validatingId, setValidatingId] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [form, setForm] = useState({
    contact_name: 'Internal Relocation',
    schedule_date: new Date().toISOString().split('T')[0],
    source_location_id: '',
    destination_location_id: '',
    product_id: '',
    quantity: 5,
  })

  function fetchTransfers() {
    setLoading(true)
    operationsApi
      .list({ type: 'transfer', search: search || undefined })
      .then(setTransfers)
      .catch((err) => console.error('Failed to fetch transfers', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTransfers()
    Promise.all([productsApi.list(), warehousesApi.listLocations()])
      .then(([prods, locs]) => {
        setProducts(prods)
        setLocations(locs)
      })
      .catch((err) => console.error(err))
  }, [])

  function handleOpenModal() {
    setForm({
      contact_name: 'Internal Relocation',
      schedule_date: new Date().toISOString().split('T')[0],
      source_location_id: locations[0]?.id ? String(locations[0].id) : '',
      destination_location_id: locations[1]?.id ? String(locations[1].id) : (locations[0]?.id ? String(locations[0].id) : ''),
      product_id: products[0]?.id ? String(products[0].id) : '',
      quantity: 5,
    })
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  async function handleCreateTransfer(e: React.FormEvent) {
    e.preventDefault()
    if (form.source_location_id === form.destination_location_id) {
      setErrorMsg('Source and destination locations must be different.')
      return
    }
    setErrorMsg(null)
    setSubmitting(true)
    try {
      await operationsApi.create({
        type: 'transfer',
        contact_name: form.contact_name,
        schedule_date: form.schedule_date,
        source_location_id: parseInt(form.source_location_id),
        destination_location_id: parseInt(form.destination_location_id),
        lines: [
          {
            product_id: parseInt(form.product_id),
            quantity: Number(form.quantity),
          },
        ],
      })
      setIsModalOpen(false)
      setSuccessMsg('Transfer order created!')
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchTransfers()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Failed to create transfer.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleValidate(opId: number) {
    setErrorMsg(null)
    setValidatingId(opId)
    try {
      await operationsApi.validate(opId)
      setSuccessMsg('Transfer completed and inventory relocated!')
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchTransfers()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Transfer execution failed.')
    } finally {
      setValidatingId(null)
    }
  }

  const columns = [
    {
      key: 'reference',
      header: 'Reference',
      cell: (op: Operation) => (
        <span className="font-mono font-semibold text-slate-900">
          {op.reference}
        </span>
      ),
    },
    {
      key: 'movement',
      header: 'Source → Destination',
      cell: (op: Operation) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <span className="font-semibold text-gray-800">
            {op.source_location_name || 'Source'}
          </span>
          <ArrowRight size={13} className="text-gray-400" />
          <span className="font-semibold text-indigo-600">
            {op.destination_location_name || 'Destination'}
          </span>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items to Move',
      cell: (op: Operation) => (
        <div className="space-y-0.5">
          {op.lines.map((l) => (
            <p key={l.id} className="text-xs text-gray-700">
              <span className="font-semibold">{l.quantity}</span> {l.unit_of_measure} · {l.product_name}
            </p>
          ))}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Scheduled Date',
      cell: (op: Operation) => (
        <span className="text-gray-500 text-xs">
          {op.schedule_date ? String(op.schedule_date) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (op: Operation) => (
        <Badge variant={op.status === 'done' ? 'success' : 'neutral'} dot>
          {op.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (op: Operation) => {
        if (op.status === 'done') {
          return <span className="text-xs text-emerald-600 font-medium">Completed</span>
        }
        return (
          <Button
            size="sm"
            onClick={() => handleValidate(op.id)}
            loading={validatingId === op.id}
          >
            Complete Transfer
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Internal Transfers"
        description="Relocate inventory stock between warehouse bays, racks, and facilities."
        actions={
          <Button size="sm" onClick={handleOpenModal}>
            <Plus size={14} className="mr-1.5" />
            New Transfer
          </Button>
        }
      />

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <form onSubmit={(e) => { e.preventDefault(); fetchTransfers() }} className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transfer reference…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      <Card padding="none" className="overflow-hidden">
        {transfers.length === 0 && !loading ? (
          <EmptyState
            icon={ArrowRightLeft}
            title="No internal transfers recorded"
            description="Create a transfer order to safely relocate stock between locations."
            action={
              <Button size="sm" onClick={handleOpenModal}>
                <Plus size={14} className="mr-1" /> New Transfer
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={transfers}
            keyExtractor={(t) => t.id}
            loading={loading}
          />
        )}
      </Card>

      {/* New Transfer Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Internal Stock Transfer"
        size="md"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="src-loc" className="text-sm font-medium text-gray-700">
                Source Location (From)
              </label>
              <select
                id="src-loc"
                required
                value={form.source_location_id}
                onChange={(e) => setForm({ ...form, source_location_id: e.target.value })}
                className="h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.short_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="dst-loc" className="text-sm font-medium text-gray-700">
                Destination Location (To)
              </label>
              <select
                id="dst-loc"
                required
                value={form.destination_location_id}
                onChange={(e) => setForm({ ...form, destination_location_id: e.target.value })}
                className="h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.short_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="prod" className="text-sm font-medium text-gray-700">
                Product to Transfer
              </label>
              <select
                id="prod"
                required
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                className="h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Transfer Quantity"
              id="qty"
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 1 })}
            />
          </div>

          <Input
            label="Scheduled Date"
            id="date"
            type="date"
            required
            value={form.schedule_date}
            onChange={(e) => setForm({ ...form, schedule_date: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Create Transfer
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
