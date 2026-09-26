import { HeartPulse } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Inventory Health page — intelligence insights on stock health.
 * TODO: Connect to backend Intelligence/Health API after contract is finalised.
 */
export function InventoryHealthPage() {
  return (
    <PlaceholderPage
      title="Inventory Health"
      description="AI-powered insights into stock health, dead stock, and turnover rates."
      icon={HeartPulse}
    />
  )
}
