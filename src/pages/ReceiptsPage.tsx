import { useEffect, useState } from 'react'
import { ArrowDownToLine, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react'
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
  type Warehouse,
  type LocationItem,
  isApiError,
} from '../api/client'

export function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Operation[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
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
    schedule_date: new Date().toISOString().split('T')[0],
    warehouse_id: '',
    destination_location_id: '',
    product_id: '',
    quantity: 10,
  })

  function fetchReceipts() {
    setLoading(true)
    operationsApi
      .list({
        type: 'receipt',
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search || undefined,
      })
      .then(setReceipts)
      .catch((err) => console.error('Failed to fetch receipts', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReceipts()
    Promise.all([productsApi.list(), warehousesApi.list(), warehousesApi.listLocations()])
      .then(([prods, whs, locs]) => {
        setProducts(prods)
        setWarehouses(whs)
        setLocations(locs)
      })
      .catch((err) => console.error(err))
  }, [statusFilter])

  function handleOpenModal() {
    setForm({
      contact_name: '',
      schedule_date: new Date().toISOString().split('T')[0],
      warehouse_id: warehouses[0]?.id ? String(warehouses[0].id) : '',
      destination_location_id: locations[0]?.id ? String(locations[0].id) : '',
      product_id: products[0]?.id ? String(products[0].id) : '',
      quantity: 10,
    })
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  async function handleCreateReceipt(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSubmitting(true)
    try {
      await operationsApi.create({
        type: 'receipt',
        contact_name: form.contact_name,
        schedule_date: form.schedule_date,
        warehouse_id: form.warehouse_id ? parseInt(form.warehouse_id) : undefined,
        destination_location_id: form.destination_location_id ? parseInt(form.destination_location_id) : undefined,
        lines: [
          {
            product_id: parseInt(form.product_id),
            quantity: Number(form.quantity),
          },
        ],
      })
      setIsModalOpen(false)
      setSuccessMsg('Receipt created successfully!')
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchReceipts()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Failed to create receipt.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleValidate(opId: number) {
    setErrorMsg(null)
    setValidatingId(opId)
    try {
      await operationsApi.validate(opId)
      setSuccessMsg('Stock intake validated and added to inventory!')
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchReceipts()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Validation failed.')
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
      key: 'vendor',
      header: 'Vendor / Supplier',
      cell: (op: Operation) => (
        <span className="font-medium text-slate-700">
          {op.contact_name || '—'}
        </span>
      ),
    },
    {
      key: 'destination',
      header: 'Destination Location',
      cell: (op: Operation) => (
        <span className="text-gray-600 text-xs font-medium">
          {op.destination_location_name || op.warehouse_name || 'General Stock'}
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
      header: 'Products & Qty',
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
      key: 'status',
      header: 'Status',
      cell: (op: Operation) => (
        <Badge
          variant={
            op.status === 'done'
              ? 'success'
              : op.status === 'ready'
                ? 'info'
                : op.status === 'cancelled'
                  ? 'danger'
                  : 'neutral'
          }
          dot
        >
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
        if (op.status === 'cancelled') {
          return <span className="text-xs text-gray-400">Cancelled</span>
        }
        return (
          <Button
            size="sm"
            onClick={() => handleValidate(op.id)}
            loading={validatingId === op.id}
          >
            Validate & Receive
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Receipts"
        description="Track incoming shipments, purchase orders, and supplier intakes."
        actions={
          <Button size="sm" onClick={handleOpenModal}>
            <Plus size={14} className="mr-1.5" />
            New Receipt
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
        <form onSubmit={(e) => { e.preventDefault(); fetchReceipts() }} className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or vendor…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-1.5">
          {['All', 'ready', 'draft', 'done'].map((st) => (
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
        {receipts.length === 0 && !loading ? (
          <EmptyState
            icon={ArrowDownToLine}
            title="No receipts found"
            description="Create an inbound receipt when receiving shipments from vendors."
            action={
              <Button size="sm" onClick={handleOpenModal}>
                <Plus size={14} className="mr-1" /> New Receipt
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={receipts}
            keyExtractor={(r) => r.id}
            loading={loading}
          />
        )}
      </Card>

      {/* New Receipt Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Inbound Receipt"
        size="md"
      >
        <form onSubmit={handleCreateReceipt} className="space-y-4">
          <Input
            label="Vendor / Supplier Name"
            id="vendor"
            required
            placeholder="e.g. Apex Steel Suppliers"
            value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
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
              <label htmlFor="dst-loc" className="text-sm font-medium text-gray-700">
                Destination Location
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
                Product
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
              label="Intake Quantity"
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
              Create Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
