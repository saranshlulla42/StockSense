import type { CreateTransferInput, TransferStatus, WarehouseTransfer } from '../types/operations'
import { INITIAL_TRANSFERS } from './mockData'

const STORAGE_KEY = 'stocksense_mock_transfers'

function loadTransfers(): WarehouseTransfer[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // fallback
  }
  return [...INITIAL_TRANSFERS]
}

function saveTransfers(transfers: WarehouseTransfer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transfers))
  } catch {
    // ignore
  }
}

let inMemoryTransfers: WarehouseTransfer[] = loadTransfers()

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

const TRANSFER_STATUS_ORDER: TransferStatus[] = ['Created', 'Accepted', 'In Transit', 'Received']

export const transferService = {
  async getTransfers(): Promise<WarehouseTransfer[]> {
    return Promise.resolve([...inMemoryTransfers])
  },

  async getTransferById(id: string): Promise<WarehouseTransfer | null> {
    const trf = inMemoryTransfers.find((t) => t.id === id)
    return Promise.resolve(trf ? { ...trf } : null)
  },

  async createTransfer(input: CreateTransferInput): Promise<WarehouseTransfer> {
    const newId = `TRF-${3000 + inMemoryTransfers.length + 1}`
    const now = formatNow()
    const sku = input.sku || `SKU-${input.product.substring(0, 3).toUpperCase()}-01`

    const newTransfer: WarehouseTransfer = {
      id: newId,
      sourceWarehouse: input.sourceWarehouse,
      destinationWarehouse: input.destinationWarehouse,
      product: input.product,
      sku,
      quantity: input.quantity,
      notes: input.notes,
      priority: input.priority || 'Standard',
      status: 'Created',
      createdAt: now,
      timeline: [
        {
          key: 'Created',
          label: 'Created',
          timestamp: now,
          user: 'Current Warehouse Operator',
          description: 'Transfer request generated and queued for approval.',
        },
        {
          key: 'Accepted',
          label: 'Accepted',
          timestamp: null,
          user: null,
          description: 'Pending source warehouse supervisor acceptance.',
        },
        {
          key: 'In Transit',
          label: 'In Transit',
          timestamp: null,
          user: null,
          description: 'Pending freight loading and departure.',
        },
        {
          key: 'Received',
          label: 'Received',
          timestamp: null,
          user: null,
          description: 'Pending arrival and verification at destination.',
        },
      ],
    }

    inMemoryTransfers = [newTransfer, ...inMemoryTransfers]
    saveTransfers(inMemoryTransfers)
    return Promise.resolve(newTransfer)
  },

  async updateTransferStatus(
    id: string,
    nextStatus: TransferStatus,
    responsibleUser: string = 'Operations Lead',
    note?: string,
  ): Promise<WarehouseTransfer> {
    const index = inMemoryTransfers.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error(`Transfer ${id} not found`)
    }

    const trf = inMemoryTransfers[index]
    const targetIdx = TRANSFER_STATUS_ORDER.indexOf(nextStatus)

    const updatedTimeline = trf.timeline.map((step) => {
      const stepIdx = TRANSFER_STATUS_ORDER.indexOf(step.key as TransferStatus)
      if (stepIdx <= targetIdx) {
        return {
          ...step,
          timestamp: step.timestamp || formatNow(),
          user: step.user || responsibleUser,
          description: stepIdx === targetIdx && note ? note : step.description,
        }
      }
      return {
        ...step,
        timestamp: null,
        user: null,
      }
    })

    const updatedTransfer: WarehouseTransfer = {
      ...trf,
      status: nextStatus,
      timeline: updatedTimeline,
    }

    inMemoryTransfers[index] = updatedTransfer
    saveTransfers(inMemoryTransfers)
    return Promise.resolve(updatedTransfer)
  },

  async resetTransfers(): Promise<WarehouseTransfer[]> {
    inMemoryTransfers = [...INITIAL_TRANSFERS]
    saveTransfers(inMemoryTransfers)
    return Promise.resolve([...inMemoryTransfers])
  },
}
