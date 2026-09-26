import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Truck,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
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
  Shipped: 'Dispatch: Mark Out for Delivery',
  'Out for Delivery': 'Confirm Delivery: Mark as Delivered',
  Delivered: 'Completed',
}

export function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    let isMounted = true
    shipmentService.getShipmentById(id).then((found) => {
      if (isMounted) {
        setShipment(found)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [id])

  const handleAdvanceStatus = async (nextStatus: ShipmentStatus) => {
    if (!shipment) return
    setActionLoading(true)
    try {
      const updated = await shipmentService.updateShipmentStatus(
        shipment.id,
        nextStatus,
        nextStatus === 'Out for Delivery'
          ? 'James O\'Connor (Regional Courier)'
          : 'Robert Ramos (Dock Supervisor)',
        nextStatus === 'Out for Delivery'
          ? 'Package out for local delivery.'
          : 'Package signed and received at dock.',
      )
      setShipment(updated)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading shipment details..." />
  }

  if (!shipment) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold text-gray-800">Shipment not found</h2>
        <p className="text-sm text-gray-500 mt-1">
          The requested shipment ID does not exist or has been removed.
        </p>
        <Link to="/shipments" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            <ArrowLeft size={14} /> Back to Shipments
          </Button>
        </Link>
      </div>
    )
  }

  const nextStatus = NEXT_STATUS[shipment.status]

  return (
    <>
      <div className="mb-4">
        <Link
          to="/shipments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Shipment Tracking
        </Link>
      </div>

      <PageHeader
        title={`Shipment ${shipment.id}`}
        description={`Outbound fulfillment manifest linked to ${shipment.orderId}`}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={STATUS_VARIANTS[shipment.status]} dot>
              {shipment.status}
            </Badge>
            {nextStatus && (
              <Button
                variant="primary"
                size="md"
                loading={actionLoading}
                onClick={() => handleAdvanceStatus(nextStatus)}
              >
                {ACTION_LABELS[shipment.status]}
                <ArrowRight size={15} />
              </Button>
            )}
          </div>
        }
      />

      {/* Prominent Horizontal Timeline Card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Delivery Milestones & Progress
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Horizontal tracking timeline. Completed milestones are purple, current step is outlined, upcoming are gray.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Carrier:</span>
            <span className="text-xs font-semibold text-gray-800">{shipment.carrier}</span>
          </div>
        </div>

        {/* The Reusable StatusTimeline Component */}
        <StatusTimeline
          milestones={shipment.timeline}
          currentStatusKey={shipment.status}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping & Route Overview */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Route & Logistics Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                Destination Address
              </span>
              <div className="flex items-start gap-2 mt-1">
                <MapPin size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span className="font-medium text-gray-800 leading-relaxed">
                  {shipment.destination}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                Carrier & Tracking
              </span>
              <div className="flex items-start gap-2 mt-1">
                <Truck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">{shipment.carrier}</p>
                  <p className="text-gray-500 font-mono text-[11px] mt-0.5">
                    {shipment.trackingNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                Dispatch Date
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={15} className="text-gray-500 shrink-0" />
                <span className="font-medium text-gray-800">{shipment.createdDate}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                Estimated Delivery
              </span>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                <span className="font-medium text-gray-800">{shipment.estimatedDelivery}</span>
              </div>
            </div>
          </div>

          {/* Items manifest */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Package Contents Manifest
            </h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Item Name</th>
                    <th className="px-4 py-2.5 text-left font-semibold">SKU</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shipment.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 font-mono">
                        {item.sku}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                        {item.quantity} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Linked Order & Status Action Card */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-3">
              Linked Sales Order
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
                  Order Reference
                </span>
                <p className="font-semibold text-indigo-600 text-sm mt-0.5">
                  {shipment.orderId}
                </p>
              </div>

              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
                  Customer
                </span>
                <p className="font-medium text-gray-800 mt-0.5">
                  {shipment.customer}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <Link to="/orders">
                  <Button variant="secondary" size="sm" className="w-full">
                    <ExternalLink size={13} />
                    View in Sales Orders
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-50/50 to-indigo-50/40 border-purple-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-900 mb-2">
              Dispatch Action Controls
            </h3>
            <p className="text-xs text-purple-700 leading-relaxed mb-4">
              {shipment.status === 'Delivered'
                ? 'This shipment has completed all milestones and has been verified at the delivery dock.'
                : 'Advance this shipment to the next logistical milestone. All timestamps and operators are logged immediately.'}
            </p>

            {nextStatus ? (
              <Button
                variant="primary"
                size="md"
                className="w-full"
                loading={actionLoading}
                onClick={() => handleAdvanceStatus(nextStatus)}
              >
                {ACTION_LABELS[shipment.status]}
              </Button>
            ) : (
              <div className="p-2.5 rounded-lg bg-green-100/70 border border-green-200 text-green-800 text-xs font-medium flex items-center justify-center gap-1.5">
                <CheckCircle2 size={15} /> All Milestones Completed
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
