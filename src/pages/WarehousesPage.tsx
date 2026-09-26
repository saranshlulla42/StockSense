import { Warehouse } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Warehouses & Locations settings page.
 * TODO: Connect to backend Settings/Warehouse API after contract is finalised.
 */
export function WarehousesPage() {
  return (
    <PlaceholderPage
      title="Warehouses & Locations"
      description="Configure warehouses, storage locations, and location hierarchies."
      icon={Warehouse}
    />
  )
}
