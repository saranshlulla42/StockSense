import { ArrowUpFromLine } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Deliveries page — outgoing stock to customers.
 * TODO: Connect to backend Deliveries API after contract is finalised.
 */
export function DeliveriesPage() {
  return (
    <PlaceholderPage
      title="Deliveries"
      description="Manage outgoing stock deliveries to customers and destinations."
      icon={ArrowUpFromLine}
    />
  )
}
