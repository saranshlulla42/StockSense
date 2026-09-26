import { RefreshCw } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Smart Reorder page — intelligent reorder suggestions.
 * TODO: Connect to backend Smart Reorder API after contract is finalised.
 */
export function SmartReorderPage() {
  return (
    <PlaceholderPage
      title="Smart Reorder"
      description="Automated reorder point suggestions based on consumption patterns and lead times."
      icon={RefreshCw}
    />
  )
}
