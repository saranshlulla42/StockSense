import type { Shipment, ShipmentStatus } from '../types/operations'
import { INITIAL_SHIPMENTS } from './mockData'

const STORAGE_KEY = 'stocksense_mock_shipments'

function loadShipments(): Shipment[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // fallback
  }
  return [...INITIAL_SHIPMENTS]
}

function saveShipments(shipments: Shipment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments))
  } catch {
    // ignore
  }
}

let inMemoryShipments: Shipment[] = loadShipments()

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

const SHIPMENT_STATUS_ORDER: ShipmentStatus[] = ['Shipped', 'Out for Delivery', 'Delivered']

export const shipmentService = {
  async getShipments(): Promise<Shipment[]> {
    return Promise.resolve([...inMemoryShipments])
  },

  async getShipmentById(id: string): Promise<Shipment | null> {
    const shipment = inMemoryShipments.find((s) => s.id === id)
    return Promise.resolve(shipment ? { ...shipment } : null)
  },

  async updateShipmentStatus(
    id: string,
    nextStatus: ShipmentStatus,
    responsibleUser: string = 'Current Dispatch Lead',
    note?: string,
  ): Promise<Shipment> {
    const index = inMemoryShipments.findIndex((s) => s.id === id)
    if (index === -1) {
      throw new Error(`Shipment ${id} not found`)
    }

    const shipment = inMemoryShipments[index]
    const targetIdx = SHIPMENT_STATUS_ORDER.indexOf(nextStatus)

    // Update timeline milestones
    const updatedTimeline = shipment.timeline.map((step) => {
      const stepIdx = SHIPMENT_STATUS_ORDER.indexOf(step.key as ShipmentStatus)
      if (stepIdx <= targetIdx) {
        // Milestone reached or completed
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

    const updatedShipment: Shipment = {
      ...shipment,
      status: nextStatus,
      timeline: updatedTimeline,
    }

    inMemoryShipments[index] = updatedShipment
    saveShipments(inMemoryShipments)
    return Promise.resolve(updatedShipment)
  },

  async resetShipments(): Promise<Shipment[]> {
    inMemoryShipments = [...INITIAL_SHIPMENTS]
    saveShipments(inMemoryShipments)
    return Promise.resolve([...inMemoryShipments])
  },
}
