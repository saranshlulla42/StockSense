import { useState, useEffect, useId } from 'react'
import {
  Plus,
  Search,
  CheckCircle2,
  ArrowRight,
  Eye,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { LoadingState } from '../components/ui/LoadingState'
import { orderService } from '../services/orderService'
import { SAMPLE_PRODUCTS } from '../services/mockData'
import type { SalesOrder, SalesOrderStatus } from '../types/operations'

const STATUS_VARIANTS: Record<SalesOrderStatus, 'neutral' | 'info' | 'warning' | 'success'> = {
  Placed: 'neutral',
  Confirmed: 'info',
  Processing: 'warning',
  Packed: 'success',
}

const NEXT_STATUS_MAP: Record<SalesOrderStatus, SalesOrderStatus | null> = {
  Placed: 'Confirmed',
  Confirmed: 'Processing',
  Processing: 'Packed',
  Packed: null,
}

const ACTION_LABELS: Record<SalesOrderStatus, string> = {
  Placed: 'Confirm Order',
  Confirmed: 'Start Processing',
  Processing: 'Mark as Packed',
  Packed: 'Completed',
}

export function OrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Form State
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerType, setCustomerType] = useState<'Retailer' | 'Corporate' | 'Distributor'>('Retailer')
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0])
  const [orderNotes, setOrderNotes] = useState('')
  const [lineItems, setLineItems] = useState([
    {
      productName: SAMPLE_PRODUCTS[0].name,
      sku: SAMPLE_PRODUCTS[0].sku,
      quantity: 10,
      unitPrice: SAMPLE_PRODUCTS[0].defaultPrice,
    },
  ])
  const [formError, setFormError] = useState<string | null>(null)

  const customerId = useId()
  const emailId = useId()
  const typeId = useId()
  const dateId = useId()

  useEffect(() => {
    let isMounted = true
    orderService.getOrders().then((data) => {
      if (isMounted) {
        setOrders(data)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Status transitions
  const handleAdvanceStatus = async (orderId: string, nextStatus: SalesOrderStatus) => {
    setActionLoading(true)
    try {
      const updated = await orderService.updateOrderStatus(orderId, nextStatus)
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      if (selectedOrder && selectedOrder.id === updated.id) {
        setSelectedOrder(updated)
      }
    } finally {
      setActionLoading(false)
    }
  }

  // Create order
  const handleAddLineItem = () => {
    const nextProd = SAMPLE_PRODUCTS[lineItems.length % SAMPLE_PRODUCTS.length]
    setLineItems([
      ...lineItems,
      {
        productName: nextProd.name,
        sku: nextProd.sku,
        quantity: 5,
        unitPrice: nextProd.defaultPrice,
      },
    ])
  }

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const handleProductSelect = (index: number, productName: string) => {
    const found = SAMPLE_PRODUCTS.find((p) => p.name === productName)
    if (found) {
      const updated = [...lineItems]
      updated[index] = {
        ...updated[index],
        productName: found.name,
        sku: found.sku,
        unitPrice: found.defaultPrice,
      }
      setLineItems(updated)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!customerName.trim()) {
      setFormError('Customer name is required.')
      return
    }
    if (!customerEmail.trim()) {
      setFormError('Customer contact email is required.')
      return
    }
    if (lineItems.some((i) => i.quantity <= 0)) {
      setFormError('All quantities must be greater than zero.')
      return
    }

    setActionLoading(true)
    try {
      const newOrder = await orderService.createOrder({
        customer: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerType,
        orderDate,
        notes: orderNotes.trim() || undefined,
        items: lineItems,
      })
      setOrders((prev) => [newOrder, ...prev])
      setIsCreateOpen(false)
      // reset form
      setCustomerName('')
      setCustomerEmail('')
      setOrderNotes('')
      setLineItems([
        {
          productName: SAMPLE_PRODUCTS[0].name,
          sku: SAMPLE_PRODUCTS[0].sku,
          quantity: 10,
          unitPrice: SAMPLE_PRODUCTS[0].defaultPrice,
        },
      ])
    } finally {
      setActionLoading(false)
    }
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Summary counts
  const countPlaced = orders.filter((o) => o.status === 'Placed').length
  const countConfirmed = orders.filter((o) => o.status === 'Confirmed').length
  const countProcessing = orders.filter((o) => o.status === 'Processing').length
  const countPacked = orders.filter((o) => o.status === 'Packed').length

  return (
    <>
      <PageHeader
        title="Sales Orders"
        description="Monitor, approve, and fulfill customer orders placed by retail partners and commercial accounts."
        actions={
          <Button
            size="md"
            id="create-order-btn"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} />
            Create Sales Order
          </Button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Placed (New)
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{countPlaced}</span>
            <span className="text-xs text-gray-500">Awaiting confirmation</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Confirmed
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-700">{countConfirmed}</span>
            <span className="text-xs text-indigo-500">Ready for pick</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Processing
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700">{countProcessing}</span>
            <span className="text-xs text-amber-600">On warehouse floor</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
            Packed
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-green-700">{countPacked}</span>
            <span className="text-xs text-green-600">Ready for carrier</span>
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
            placeholder="Search by order ID, customer, or SKU..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'Placed', 'Confirmed', 'Processing', 'Packed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      {loading ? (
        <LoadingState message="Loading sales orders..." />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Products & Units
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                      No sales orders found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0)
                    const nextStatus = NEXT_STATUS_MAP[order.status]

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 text-left cursor-pointer"
                          >
                            {order.id}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">{order.customer}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block rounded bg-gray-100 px-1.5 py-0.2 text-[10px] text-gray-600">
                              {order.customerType}
                            </span>
                            <span>{order.customerEmail}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs text-gray-800 font-medium line-clamp-1">
                            {order.items.map((i) => i.productName).join(', ')}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {totalQty} units total
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-600">
                          {order.orderDate}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-900">
                          ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge variant={STATUS_VARIANTS[order.status]} dot>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              title="View Order Details"
                            >
                              <Eye size={13} />
                              Details
                            </Button>

                            {nextStatus && (
                              <Button
                                variant="primary"
                                size="sm"
                                loading={actionLoading}
                                onClick={() => handleAdvanceStatus(order.id, nextStatus)}
                                title={`Advance to ${nextStatus}`}
                              >
                                {ACTION_LABELS[order.status]}
                                <ArrowRight size={13} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Sales Order: ${selectedOrder.id}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-500">
                Created: {selectedOrder.orderDate}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                {NEXT_STATUS_MAP[selectedOrder.status] && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading}
                    onClick={() =>
                      handleAdvanceStatus(selectedOrder.id, NEXT_STATUS_MAP[selectedOrder.status]!)
                    }
                  >
                    {ACTION_LABELS[selectedOrder.status]}
                    <ArrowRight size={13} />
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Customer</p>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{selectedOrder.customer}</h3>
                <p className="text-xs text-gray-500">{selectedOrder.customerEmail} • {selectedOrder.customerType}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status</p>
                <div className="mt-1">
                  <Badge variant={STATUS_VARIANTS[selectedOrder.status]} dot>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Ordered Products
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">Product</th>
                      <th className="px-4 py-2.5 text-left font-semibold">SKU</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Unit Price</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Qty</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{item.sku}</td>
                        <td className="px-4 py-2.5 text-right text-gray-700">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50/80 font-bold border-t border-gray-200">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right text-gray-700">Order Grand Total:</td>
                      <td className="px-4 py-3 text-right text-indigo-700 text-base">
                        ${selectedOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                <span className="font-semibold">Special Instructions: </span>
                {selectedOrder.notes}
              </div>
            )}

            {/* Audit Log / History */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Order Activity & Status Audit
              </h4>
              <div className="space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                {selectedOrder.auditLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-800">{log.status}</span>
                        {log.note && <span className="text-gray-500 ml-1.5">— {log.note}</span>}
                        <div className="text-[11px] text-gray-400">By {log.updatedBy}</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Order Modal */}
      {isCreateOpen && (
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Sales Order"
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
                Create Order
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
              <Input
                id={customerId}
                label="Customer / Business Name"
                placeholder="e.g. Acme Retailers Corp"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <Input
                id={emailId}
                label="Procurement Email"
                type="email"
                placeholder="procurement@acme.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id={typeId}
                label="Customer Type"
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as any)}
                options={[
                  { value: 'Retailer', label: 'Retailer' },
                  { value: 'Corporate', label: 'Corporate' },
                  { value: 'Distributor', label: 'Distributor' },
                ]}
              />
              <Input
                id={dateId}
                label="Order Date"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
              />
            </div>

            {/* Line items section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Products & Quantities
                </label>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add Product
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50/50"
                  >
                    <div className="flex-1">
                      <select
                        aria-label={`Select product for item ${idx + 1}`}
                        value={item.productName}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {SAMPLE_PRODUCTS.map((prod) => (
                          <option key={prod.sku} value={prod.name}>
                            {prod.name} (${prod.defaultPrice.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        aria-label={`Quantity for item ${idx + 1}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          const updated = [...lineItems]
                          updated[idx].quantity = val
                          setLineItems(updated)
                        }}
                        className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-center font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="w-24 text-right text-xs font-semibold text-gray-700">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>

                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Order estimated total */}
              <div className="mt-3 flex justify-between items-center px-3 py-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs">
                <span className="font-medium text-indigo-900">Calculated Subtotal:</span>
                <span className="font-bold text-indigo-900 text-sm">
                  ${lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes / Delivery Requests (Optional)
              </label>
              <textarea
                id="notes"
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Special loading dock requirements, priority handling..."
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
