import { useEffect, useState } from 'react'
import { ArrowUpFromLine, Plus, Search, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
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

export function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Operation[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [validatingId, setValidatingId] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [form, setForm] = useState({
    contact_name: '',
    delivery_address: '',
    schedule_date: new Date().toISOString().split('T')[0],
    source_location_id: '',
    product_id: '',
    quantity: 5,
  })

  function fetchDeliveries() {
    setLoading(true)
    operationsApi
      .list({
        type: 'delivery',
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search || undefined,
      })
      .then(setDeliveries)
      .catch((err) => console.error('Failed to fetch deliveries', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDeliveries()
    Promise.all([productsApi.list(), warehousesApi.listLocations()])
      .then(([prods, locs]) => {
        setProducts(prods)
        setLocations(locs)
      })
      .catch((err) => console.error(err))
  }, [statusFilter])

  function handleOpenModal() {
    setForm({
      contact_name: '',
      delivery_address: '',
      schedule_date: new Date().toISOString().split('T')[0],
      source_location_id: locations[0]?.id ? String(locations[0].id) : '',
      product_id: products[0]?.id ? String(products[0].id) : '',
      quantity: 5,
    })
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  async function handleCreateDelivery(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSubmitting(true)
    try {
      await operationsApi.create({
        type: 'delivery',
        contact_name: form.contact_name,
        delivery_address: form.delivery_address,
        schedule_date: form.schedule_date,
        source_location_id: form.source_location_id ? parseInt(form.source_location_id) : undefined,
        lines: [
          {
            product_id: parseInt(form.product_id),
            quantity: Number(form.quantity),
          },
        ],
      })
      setIsModalOpen(false)
      setSuccessMsg('Delivery order created!')
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchDeliveries()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Failed to create delivery.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleValidate(opId: number) {
    setErrorMsg(null)
    setValidatingId(opId)
    try {
      await operationsApi.validate(opId)
      setSuccessMsg('Delivery dispatched and stock deducted!')
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchDeliveries()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Dispatch failed.')
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
      key: 'customer',
      header: 'Customer / Destination',
      cell: (op: Operation) => (
        <div>
          <p className="font-medium text-slate-800">{op.contact_name || '—'}</p>
          {op.delivery_address && (
            <p className="text-[11px] text-gray-400 truncate max-w-xs">{op.delivery_address}</p>
          )}
        </div>
      ),
    },
    {
      key: 'source',
      header: 'From Location',
      cell: (op: Operation) => (
        <span className="text-gray-600 text-xs font-medium">
          {op.source_location_name || 'General Stock'}
        </span>
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
      key: 'items',
      header: 'Order Lines',
      cell: (op: Operation) => (
        <div className="space-y-0.5">
          {op.lines.map((l) => (
            <div key={l.id} className="flex items-center gap-1.5 text-xs text-gray-700">
              {l.is_out_of_stock && (
                <span title="Insufficient stock in source location">
                  <AlertTriangle size={13} className="text-amber-500" />
                </span>
              )}
              <span>
                <span className="font-semibold">{l.quantity}</span> {l.unit_of_measure} · {l.product_name}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (op: Operation) => (
        <Badge
          variant={
            op.status === 'done'
              ? 'success'
              : op.status === 'waiting'
                ? 'warning'
                : op.status === 'ready'
                  ? 'info'
                  : 'neutral'
          }
          dot
        >
          {op.status === 'waiting' ? 'Waiting for stock' : op.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (op: Operation) => {
        if (op.status === 'done') {
          return <span className="text-xs text-emerald-600 font-medium">Dispatched</span>
        }
        if (op.status === 'cancelled') {
          return <span className="text-xs text-gray-400">Cancelled</span>
        }
        return (
          <Button
            size="sm"
            onClick={() => handleValidate(op.id)}
            loading={validatingId === op.id}
          >
            Validate & Dispatch
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Deliveries"
        description="Manage customer dispatches, outbound fulfillment, and shipping schedules."
        actions={
          <Button size="sm" onClick={handleOpenModal}>
            <Plus size={14} className="mr-1.5" />
            New Delivery
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

      {/* Filter and Search */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchDeliveries() }} className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or customer…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-1.5">
          {['All', 'ready', 'waiting', 'done'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === st
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        {deliveries.length === 0 && !loading ? (
          <EmptyState
            icon={ArrowUpFromLine}
            title="No delivery orders found"
            description="Create an outbound delivery order to pick and dispatch stock."
            action={
              <Button size="sm" onClick={handleOpenModal}>
                <Plus size={14} className="mr-1" /> New Delivery
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={deliveries}
            keyExtractor={(d) => d.id}
            loading={loading}
          />
        )}
      </Card>

      {/* New Delivery Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Outbound Delivery"
        size="md"
      >
        <form onSubmit={handleCreateDelivery} className="space-y-4">
          <Input
            label="Customer / Recipient"
            id="customer"
            required
            placeholder="e.g. BuildCorp Systems Ltd"
            value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
          />

          <Input
            label="Delivery Address"
            id="address"
            placeholder="e.g. 88 Builder Ave, Suite 400"
            value={form.delivery_address}
            onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Scheduled Date"
              id="date"
              type="date"
              required
              value={form.schedule_date}
              onChange={(e) => setForm({ ...form, schedule_date: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="src-loc" className="text-sm font-medium text-gray-700">
                Source Location (Pick from)
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="prod" className="text-sm font-medium text-gray-700">
                Product to Dispatch
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
                    {p.name} (On Hand: {p.on_hand} {p.unit_of_measure})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Quantity to Dispatch"
              id="qty"
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 1 })}
            />
          </div>

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
              Create Delivery
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
