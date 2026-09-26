export type SalesOrderStatus = 'Placed' | 'Confirmed' | 'Processing' | 'Packed'

export interface SalesOrderItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
}

export interface OrderAuditLog {
  status: SalesOrderStatus
  timestamp: string
  updatedBy: string
  note?: string
}

export interface SalesOrder {
  id: string
  customer: string
  customerEmail: string
  customerType: 'Retailer' | 'Corporate' | 'Distributor'
  orderDate: string
  status: SalesOrderStatus
  items: SalesOrderItem[]
  totalAmount: number
  notes?: string
  auditLogs: OrderAuditLog[]
}

export interface CreateSalesOrderInput {
  customer: string
  customerEmail: string
  customerType: 'Retailer' | 'Corporate' | 'Distributor'
  orderDate: string
  items: {
    productName: string
    sku: string
    quantity: number
    unitPrice: number
  }[]
  notes?: string
}

export type ShipmentStatus = 'Shipped' | 'Out for Delivery' | 'Delivered'

export interface ShipmentItem {
  productName: string
  sku: string
  quantity: number
}

export interface TimelineMilestone {
  key: string
  label: string
  timestamp?: string | null
  user?: string | null
  description?: string
}

export interface Shipment {
  id: string
  orderId: string
  customer: string
  destination: string
  carrier: string
  trackingNumber: string
  items: ShipmentItem[]
  status: ShipmentStatus
  timeline: TimelineMilestone[]
  createdDate: string
  estimatedDelivery: string
}

export type TransferStatus = 'Created' | 'Accepted' | 'In Transit' | 'Received'

export interface WarehouseTransfer {
  id: string
  sourceWarehouse: string
  destinationWarehouse: string
  product: string
  sku: string
  quantity: number
  notes?: string
  priority: 'Standard' | 'Urgent'
  status: TransferStatus
  timeline: TimelineMilestone[]
  createdAt: string
}

export interface CreateTransferInput {
  sourceWarehouse: string
  destinationWarehouse: string
  product: string
  sku?: string
  quantity: number
  notes?: string
  priority?: 'Standard' | 'Urgent'
}
