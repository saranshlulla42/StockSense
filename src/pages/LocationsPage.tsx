import { MapPin } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Stock by Location page.
 * TODO: Connect to backend Location/Stock API after contract is finalised.
 */
export function LocationsPage() {
  return (
    <PlaceholderPage
      title="Stock by Location"
      description="View on-hand stock quantities broken down by warehouse and location."
      icon={MapPin}
    />
  )
}
