import { useState, useEffect, useId } from 'react'
import {
  Plus,
  Search,
  Warehouse,
  ArrowRight,
  CheckCircle2,
  Boxes,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { StatusTimeline } from '../components/ui/StatusTimeline'
import { LoadingState } from '../components/ui/LoadingState'
import { transferService } from '../services/transferService'
import { SAMPLE_WAREHOUSES, SAMPLE_PRODUCTS } from '../services/mockData'
import type { WarehouseTransfer, TransferStatus } from '../types/operations'

const STATUS_VARIANTS: Record<TransferStatus, 'neutral' | 'info' | 'warning' | 'success'> = {
  Created: 'neutral',
  Accepted: 'info',
  'In Transit': 'warning',
  Received: 'success',
}

const NEXT_STATUS: Record<TransferStatus, TransferStatus | null> = {
  Created: 'Accepted',
  Accepted: 'In Transit',
  'In Transit': 'Received',
  Received: null,
}

const ACTION_LABELS: Record<TransferStatus, string> = {
  Created: 'Accept Transfer',
  Accepted: 'Dispatch (In Transit)',
  'In Transit': 'Confirm Receipt (Received)',
  Received: 'Completed',
}

const RESPONSIBLE_OPERATORS: Record<TransferStatus, string> = {
  Created: 'Warehouse Inventory Clerk',
  Accepted: 'Elena Rostova (Source Warehouse Mgr)',
  'In Transit': 'David Park (Logistics Carrier Lead)',
  Received: 'Rachel Kim (Receiving Lead)',
}

export function TransfersPage() {
  const [transfers, setTransfers] = useState<WarehouseTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [expandedTransferId, setExpandedTransferId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Form State for Create Transfer
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [sourceWarehouse, setSourceWarehouse] = useState(SAMPLE_WAREHOUSES[0])
  const [destWarehouse, setDestWarehouse] = useState(SAMPLE_WAREHOUSES[1])
  const [selectedProduct, setSelectedProduct] = useState(SAMPLE_PRODUCTS[0].name)
  const [quantity, setQuantity] = useState<number>(25)
  const [priority, setPriority] = useState<'Standard' | 'Urgent'>('Standard')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const qtyId = useId()
  const notesId = useId()

  useEffect(() => {
    let isMounted = true
    transferService.getTransfers().then((data) => {
      if (isMounted) {
        setTransfers(data)
        if (data.length > 0) {
          setExpandedTransferId(data[0].id)
        }
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleAdvanceStatus = async (transferId: string, nextStatus: TransferStatus) => {
    setActionLoading(true)
    try {
      const user = RESPONSIBLE_OPERATORS[nextStatus]
      const updated = await transferService.updateTransferStatus(
        transferId,
        nextStatus,
        user,
        `Status transitioned to ${nextStatus}.`,
      )
      setTransfers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } finally {
      setActionLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedTransferId((prev) => (prev === id ? null : id))
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (sourceWarehouse === destWarehouse) {
      setFormError('Source warehouse and Destination warehouse cannot be identical.')
      return
    }

    if (quantity <= 0) {
      setFormError('Transfer quantity must be at least 1 unit.')
      return
    }

    const prodObj = SAMPLE_PRODUCTS.find((p) => p.name === selectedProduct)

    setActionLoading(true)
    try {
      const newTransfer = await transferService.createTransfer({
        sourceWarehouse,
        destinationWarehouse: destWarehouse,
        product: selectedProduct,
        sku: prodObj?.sku,
        quantity,
        priority,
        notes: notes.trim() || undefined,
      })

      setTransfers((prev) => [newTransfer, ...prev])
      setExpandedTransferId(newTransfer.id)
      setIsCreateOpen(false)
      // reset form
      setQuantity(25)
      setNotes('')
      setPriority('Standard')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredTransfers = transfers.filter((t) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      t.id.toLowerCase().includes(term) ||
      t.product.toLowerCase().includes(term) ||
      t.sku.toLowerCase().includes(term) ||
      t.sourceWarehouse.toLowerCase().includes(term) ||
      t.destinationWarehouse.toLowerCase().includes(term)

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Metric counts
  const countCreated = transfers.filter((t) => t.status === 'Created').length
  const countAccepted = transfers.filter((t) => t.status === 'Accepted').length
  const countInTransit = transfers.filter((t) => t.status === 'In Transit').length
  const countReceived = transfers.filter((t) => t.status === 'Received').length

  return (
    <>
      <PageHeader
        title="Internal Transfers"
        description="Coordinate inter-facility stock movements, track freight milestones, and balance warehouse inventory."
        actions={
          <Button
            size="md"
            id="create-transfer-btn"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} />
            New Transfer Request
          </Button>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Created (Queued)
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{countCreated}</span>
            <span className="text-xs text-gray-500">Pending approval</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Accepted
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-700">{countAccepted}</span>
            <span className="text-xs text-indigo-500">Staged for freight</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            In Transit
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700">{countInTransit}</span>
            <span className="text-xs text-amber-600">On carrier truck</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
            Received
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-green-700">{countReceived}</span>
            <span className="text-xs text-green-600">Shelved at dest</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by transfer ID, warehouse, or product..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'Created', 'Accepted', 'In Transit', 'Received'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {st === 'ALL' ? 'All Transfers' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer Requests List */}
      {loading ? (
        <LoadingState message="Loading internal transfers..." />
      ) : (
        <div className="space-y-4">
          {filteredTransfers.length === 0 ? (
            <Card className="p-12 text-center text-sm text-gray-400">
              No transfer requests found matching your filters.
            </Card>
          ) : (
            filteredTransfers.map((transfer) => {
              const isExpanded = expandedTransferId === transfer.id
              const nextStatus = NEXT_STATUS[transfer.status]

              return (
                <Card
                  key={transfer.id}
                  padding="none"
                  className="overflow-hidden border-gray-200 hover:border-gray-300 transition-all"
                >
                  <div className="p-5">
                    {/* Top Row: Meta, Warehouses, Status & Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left side details */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-base font-bold text-gray-900">
                            {transfer.id}
                          </span>
                          {transfer.priority === 'Urgent' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                              Urgent
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              Standard
                            </span>
                          )}
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            Requested: {transfer.createdAt}
                          </span>
                          <Badge variant={STATUS_VARIANTS[transfer.status]} dot>
                            {transfer.status}
                          </Badge>
                        </div>

                        {/* Origin -> Destination Route */}
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-700 flex-wrap">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                            <Warehouse size={13} className="text-gray-400 shrink-0" />
                            <span className="font-semibold text-gray-800">Origin:</span>
                            <span>{transfer.sourceWarehouse}</span>
                          </div>
                          <ArrowRight size={14} className="text-indigo-500 shrink-0" />
                          <div className="flex items-center gap-1.5 bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100">
                            <Warehouse size={13} className="text-indigo-500 shrink-0" />
                            <span className="font-semibold text-indigo-900">Destination:</span>
                            <span className="text-indigo-950">{transfer.destinationWarehouse}</span>
                          </div>
                        </div>

                        {/* Product & Quantity */}
                        <div className="flex items-center gap-3 text-xs text-gray-600 pt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Boxes size={13} className="text-gray-400" />
                            <span className="font-semibold text-gray-800">{transfer.product}</span>
                            <span className="text-gray-400 font-mono">({transfer.sku})</span>
                          </div>
                          <span>•</span>
                          <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {transfer.quantity} units
                          </span>
                          {transfer.notes && (
                            <>
                              <span>•</span>
                              <span className="italic text-gray-500 truncate max-w-xs">
                                Note: {transfer.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right side: Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          onClick={() => toggleExpand(transfer.id)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              Hide Milestones <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              View Milestones <ChevronDown size={14} />
                            </>
                          )}
                        </button>

                        {nextStatus ? (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={actionLoading}
                            onClick={() => handleAdvanceStatus(transfer.id, nextStatus)}
                          >
                            {ACTION_LABELS[transfer.status]}
                            <ArrowRight size={13} />
                          </Button>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200">
                            <CheckCircle2 size={13} /> Completed
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reused Horizontal StatusTimeline for Transfers */}
                    {isExpanded && (
                      <div className="mt-5 pt-4 border-t border-gray-100 bg-gray-50/70 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-900">
                            Transfer Movement Timeline
                          </h4>
                          <span className="text-[11px] text-gray-500">
                            {transfer.status === 'Received'
                              ? 'Transfer fulfilled and logged'
                              : 'Reused horizontal timeline with transfer milestones'}
                          </span>
                        </div>
                        {/* The exact same StatusTimeline component reused here! */}
                        <StatusTimeline
                          milestones={transfer.timeline}
                          currentStatusKey={transfer.status}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Create Transfer Request Modal */}
      {isCreateOpen && (
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create Internal Warehouse Transfer Request"
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={actionLoading}
                onClick={handleCreateSubmit}
              >
                Create Transfer Request
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Source Warehouse (Origin)"
                value={sourceWarehouse}
                onChange={(e) => setSourceWarehouse(e.target.value)}
                options={SAMPLE_WAREHOUSES.map((w) => ({ value: w, label: w }))}
              />
              <Select
                label="Destination Warehouse"
                value={destWarehouse}
                onChange={(e) => setDestWarehouse(e.target.value)}
                options={SAMPLE_WAREHOUSES.map((w) => ({ value: w, label: w }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Select
                  label="Product to Relocate"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  options={SAMPLE_PRODUCTS.map((p) => ({
                    value: p.name,
                    label: `${p.name} (${p.sku})`,
                  }))}
                />
              </div>

              <Input
                id={qtyId}
                label="Quantity (Units)"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Transfer Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                options={[
                  { value: 'Standard', label: 'Standard Logistics Route' },
                  { value: 'Urgent', label: 'Urgent Express Priority' },
                ]}
              />

              <div className="flex flex-col justify-end text-xs text-gray-500 pb-1">
                <span>System note: Initial status will be set to </span>
                <span className="font-semibold text-gray-800">"Created"</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={notesId} className="text-sm font-medium text-gray-700">
                Transfer Reason / Notes (Optional)
              </label>
              <textarea
                id={notesId}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Stock balancing for Chicago regional depot; pallet pre-shrink-wrapped..."
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
