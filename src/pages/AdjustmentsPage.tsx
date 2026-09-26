import { ClipboardList } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Adjustments page — manual inventory corrections.
 * TODO: Connect to backend Adjustments API after contract is finalised.
 */
export function AdjustmentsPage() {
  return (
    <PlaceholderPage
      title="Adjustments"
      description="Record manual stock corrections and cycle count results."
      icon={ClipboardList}
    />
  )
}
