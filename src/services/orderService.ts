import type { CreateSalesOrderInput, SalesOrder, SalesOrderStatus } from '../types/operations'
import { INITIAL_SALES_ORDERS } from './mockData'

const STORAGE_KEY = 'stocksense_mock_orders'

function loadOrders(): SalesOrder[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // fallback to initial data
  }
  return [...INITIAL_SALES_ORDERS]
}

function saveOrders(orders: SalesOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // ignore localstorage errors
  }
}

let inMemoryOrders: SalesOrder[] = loadOrders()

function formatNow(): string {
  const d = new Date()
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const orderService = {
  async getOrders(): Promise<SalesOrder[]> {
    // Simulating API call latency
    return Promise.resolve([...inMemoryOrders])
  },

  async getOrderById(id: string): Promise<SalesOrder | null> {
    const order = inMemoryOrders.find((o) => o.id === id)
    return Promise.resolve(order ? { ...order } : null)
  },

  async createOrder(input: CreateSalesOrderInput): Promise<SalesOrder> {
    const newId = `SO-${new Date().getFullYear()}-${String(inMemoryOrders.length + 1).padStart(3, '0')}`
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const newOrder: SalesOrder = {
      id: newId,
      customer: input.customer,
      customerEmail: input.customerEmail,
      customerType: input.customerType,
      orderDate: input.orderDate || new Date().toISOString().split('T')[0],
      status: 'Placed',
      totalAmount,
      notes: input.notes,
      items: input.items.map((item, index) => ({
        productId: `prod-new-${index + 1}`,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      auditLogs: [
        {
          status: 'Placed',
          timestamp: formatNow(),
          updatedBy: 'Operations Portal User',
          note: 'Order submitted into system',
        },
      ],
    }

    inMemoryOrders = [newOrder, ...inMemoryOrders]
    saveOrders(inMemoryOrders)
    return Promise.resolve(newOrder)
  },

  async updateOrderStatus(
    id: string,
    nextStatus: SalesOrderStatus,
    updatedBy: string = 'Current Operations User',
    note?: string,
  ): Promise<SalesOrder> {
    const index = inMemoryOrders.findIndex((o) => o.id === id)
    if (index === -1) {
      throw new Error(`Order ${id} not found`)
    }

    const order = inMemoryOrders[index]
    const updatedOrder: SalesOrder = {
      ...order,
      status: nextStatus,
      auditLogs: [
        ...order.auditLogs,
        {
          status: nextStatus,
          timestamp: formatNow(),
          updatedBy,
          note: note || `Order status updated to ${nextStatus}`,
        },
      ],
    }

    inMemoryOrders[index] = updatedOrder
    saveOrders(inMemoryOrders)
    return Promise.resolve(updatedOrder)
  },

  async resetOrders(): Promise<SalesOrder[]> {
    inMemoryOrders = [...INITIAL_SALES_ORDERS]
    saveOrders(inMemoryOrders)
    return Promise.resolve([...inMemoryOrders])
  },
}
