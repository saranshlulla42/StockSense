import { useEffect, useState } from 'react'
import { SlidersHorizontal, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react'
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

export function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Operation[]>([])
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
    adjustment_reason: 'Physical cycle count audit',
    source_location_id: '',
    product_id: '',
    counted_quantity: 0,
  })

  function fetchAdjustments() {
    setLoading(true)
    operationsApi
      .list({ type: 'adjustment', search: search || undefined })
      .then(setAdjustments)
      .catch((err) => console.error('Failed to fetch adjustments', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAdjustments()
    Promise.all([productsApi.list(), warehousesApi.listLocations()])
      .then(([prods, locs]) => {
        setProducts(prods)
        setLocations(locs)
      })
      .catch((err) => console.error(err))
  }, [])

  function handleOpenModal() {
    setForm({
      adjustment_reason: 'Physical cycle count audit',
      source_location_id: locations[0]?.id ? String(locations[0].id) : '',
      product_id: products[0]?.id ? String(products[0].id) : '',
      counted_quantity: 0,
    })
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  async function handleCreateAdjustment(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSubmitting(true)
    try {
      await operationsApi.create({
        type: 'adjustment',
        adjustment_reason: form.adjustment_reason,
        source_location_id: parseInt(form.source_location_id),
        lines: [
          {
            product_id: parseInt(form.product_id),
            quantity: Number(form.counted_quantity),
            counted_quantity: Number(form.counted_quantity),
          },
        ],
      })
      setIsModalOpen(false)
      setSuccessMsg('Stock adjustment order created!')
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchAdjustments()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Failed to create adjustment.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleValidate(opId: number) {
    setErrorMsg(null)
    setValidatingId(opId)
    try {
      await operationsApi.validate(opId)
      setSuccessMsg('Inventory adjustment reconciled and recorded in ledger!')
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchAdjustments()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Adjustment reconciliation failed.')
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
      key: 'location',
      header: 'Location',
      cell: (op: Operation) => (
        <span className="font-medium text-slate-700">
          {op.source_location_name || 'General Stock'}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Audit Reason',
      cell: (op: Operation) => (
        <span className="text-gray-600 text-xs">
          {op.adjustment_reason || 'Cycle count adjustment'}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Counted Quantity',
      cell: (op: Operation) => (
        <div className="space-y-0.5">
          {op.lines.map((l) => (
            <p key={l.id} className="text-xs text-gray-700">
              <span className="font-semibold">{l.counted_quantity ?? l.quantity}</span> {l.unit_of_measure} · {l.product_name}
            </p>
          ))}
        </div>
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
          return <span className="text-xs text-emerald-600 font-medium">Reconciled</span>
        }
        return (
          <Button
            size="sm"
            onClick={() => handleValidate(op.id)}
            loading={validatingId === op.id}
          >
            Apply Adjustment
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Adjustments"
        description="Reconcile physical inventory counts, write off damaged items, and correct ledger discrepancies."
        actions={
          <Button size="sm" onClick={handleOpenModal}>
            <Plus size={14} className="mr-1.5" />
            New Adjustment
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
        <form onSubmit={(e) => { e.preventDefault(); fetchAdjustments() }} className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search adjustment reference…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      <Card padding="none" className="overflow-hidden">
        {adjustments.length === 0 && !loading ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="No adjustments recorded"
            description="Create an adjustment order whenever physical counts differ from recorded stock."
            action={
              <Button size="sm" onClick={handleOpenModal}>
                <Plus size={14} className="mr-1" /> New Adjustment
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={adjustments}
            keyExtractor={(a) => a.id}
            loading={loading}
          />
        )}
      </Card>

      {/* New Adjustment Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Stock Adjustment"
        size="md"
      >
        <form onSubmit={handleCreateAdjustment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="loc" className="text-sm font-medium text-gray-700">
                Location Audited
              </label>
              <select
                id="loc"
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
                    {p.name} (Current: {p.on_hand} {p.unit_of_measure})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Actual Counted Physical Quantity"
            id="counted"
            type="number"
            min="0"
            required
            value={form.counted_quantity}
            onChange={(e) => setForm({ ...form, counted_quantity: parseFloat(e.target.value) || 0 })}
            hint="The exact quantity physically present at the location"
          />

          <Input
            label="Reason for Adjustment"
            id="reason"
            required
            placeholder="e.g. Cycle count discrepancy, scrap, damaged goods"
            value={form.adjustment_reason}
            onChange={(e) => setForm({ ...form, adjustment_reason: e.target.value })}
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
              Save Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
