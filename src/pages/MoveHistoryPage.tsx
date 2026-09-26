import { History } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Move History page — full audit trail of all stock moves.
 * TODO: Connect to backend Move History API after contract is finalised.
 */
export function MoveHistoryPage() {
  return (
    <PlaceholderPage
      title="Move History"
      description="Complete audit trail of all stock movements across the system."
      icon={History}
    />
  )
}
