import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  ArrowRight,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StatusTimeline } from '../components/ui/StatusTimeline'
import { LoadingState } from '../components/ui/LoadingState'
import { shipmentService } from '../services/shipmentService'
import type { Shipment, ShipmentStatus } from '../types/operations'

const STATUS_VARIANTS: Record<ShipmentStatus, 'info' | 'warning' | 'success'> = {
  Shipped: 'info',
  'Out for Delivery': 'warning',
  Delivered: 'success',
}

const NEXT_STATUS: Record<ShipmentStatus, ShipmentStatus | null> = {
  Shipped: 'Out for Delivery',
  'Out for Delivery': 'Delivered',
  Delivered: null,
}

const ACTION_LABELS: Record<ShipmentStatus, string> = {
  Shipped: 'Dispatch: Out for Delivery',
  'Out for Delivery': 'Mark Delivered',
  Delivered: 'Delivered',
}

export function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [expandedShipmentId, setExpandedShipmentId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    shipmentService.getShipments().then((data) => {
      if (isMounted) {
        setShipments(data)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleAdvanceStatus = async (shipmentId: string, nextStatus: ShipmentStatus) => {
    setActionLoading(true)
    try {
      const updated = await shipmentService.updateShipmentStatus(
        shipmentId,
        nextStatus,
        nextStatus === 'Out for Delivery'
          ? 'James O\'Connor (Regional Courier)'
          : 'Robert Ramos (Dock Supervisor)',
      )
      setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    } finally {
      setActionLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedShipmentId((prev) => (prev === id ? null : id))
  }

  const filteredShipments = shipments.filter((s) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      s.id.toLowerCase().includes(term) ||
      s.orderId.toLowerCase().includes(term) ||
      s.customer.toLowerCase().includes(term) ||
      s.destination.toLowerCase().includes(term) ||
      s.carrier.toLowerCase().includes(term)

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Metrics
  const countShipped = shipments.filter((s) => s.status === 'Shipped').length
  const countOut = shipments.filter((s) => s.status === 'Out for Delivery').length
  const countDelivered = shipments.filter((s) => s.status === 'Delivered').length

  return (
    <>
      <PageHeader
        title="Shipment Tracking"
        description="Monitor outgoing customer deliveries, line-haul freight, and milestone completions."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Live Logistics Feed</span>
          </div>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Shipped (In Transit)
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-700">{countShipped}</span>
            <span className="text-xs text-blue-500">Linehaul / Freight</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Out for Delivery
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700">{countOut}</span>
            <span className="text-xs text-amber-600">Local courier step</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
            Delivered
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-green-700">{countDelivered}</span>
            <span className="text-xs text-green-600">Dock confirmed</span>
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
            placeholder="Search by shipment ID, order ID, customer, or destination..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'Shipped', 'Out for Delivery', 'Delivered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {st === 'ALL' ? 'All Shipments' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments List */}
      {loading ? (
        <LoadingState message="Loading shipments..." />
      ) : (
        <div className="space-y-4">
          {filteredShipments.length === 0 ? (
            <Card className="p-12 text-center text-sm text-gray-400">
              No shipments found matching your filters.
            </Card>
          ) : (
            filteredShipments.map((shipment) => {
              const isExpanded = expandedShipmentId === shipment.id
              const totalItems = shipment.items.reduce((s, i) => s + i.quantity, 0)
              const nextStatus = NEXT_STATUS[shipment.status]

              return (
                <Card
                  key={shipment.id}
                  padding="none"
                  className="overflow-hidden transition-all duration-200 border-gray-200 hover:border-gray-300"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: ID, Order, Destination */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link
                            to={`/shipments/${shipment.id}`}
                            className="text-base font-bold text-indigo-600 hover:text-indigo-800 tracking-tight"
                          >
                            {shipment.id}
                          </Link>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs font-medium text-gray-600">
                            Order:{' '}
                            <span className="font-semibold text-gray-800">
                              {shipment.orderId}
                            </span>
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {shipment.customer}
                          </span>
                          <Badge variant={STATUS_VARIANTS[shipment.status]} dot>
                            {shipment.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                          <MapPin size={13} className="text-gray-400 shrink-0" />
                          <span className="truncate">{shipment.destination}</span>
                        </div>

                        <div className="text-xs text-gray-500 flex items-center gap-2 pt-0.5">
                          <span className="font-medium text-gray-700">
                            {shipment.carrier}
                          </span>
                          <span>({shipment.trackingNumber})</span>
                          <span>•</span>
                          <span>
                            {shipment.items.length} {shipment.items.length === 1 ? 'item' : 'items'} ({totalItems} units)
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          onClick={() => toggleExpand(shipment.id)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              Hide Timeline <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              Quick Timeline <ChevronDown size={14} />
                            </>
                          )}
                        </button>

                        <Link to={`/shipments/${shipment.id}`}>
                          <Button variant="secondary" size="sm">
                            <Eye size={13} /> Details
                          </Button>
                        </Link>

                        {nextStatus && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={actionLoading}
                            onClick={() => handleAdvanceStatus(shipment.id, nextStatus)}
                          >
                            {ACTION_LABELS[shipment.status]}
                            <ArrowRight size={13} />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Timeline Inline */}
                    {isExpanded && (
                      <div className="mt-5 pt-4 border-t border-gray-100 bg-gray-50/60 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-900">
                            Tracking Milestones
                          </h4>
                          <Link
                            to={`/shipments/${shipment.id}`}
                            className="text-xs text-indigo-600 hover:underline font-medium"
                          >
                            Open Full Details Page →
                          </Link>
                        </div>
                        <StatusTimeline
                          milestones={shipment.timeline}
                          currentStatusKey={shipment.status}
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
    </>
  )
}
