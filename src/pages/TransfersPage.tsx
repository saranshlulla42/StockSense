import { ArrowLeftRight } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Internal Transfers page — stock moves between internal locations.
 * TODO: Connect to backend Transfers API after contract is finalised.
 */
export function TransfersPage() {
  return (
    <PlaceholderPage
      title="Internal Transfers"
      description="Manage stock movements between internal warehouse locations."
      icon={ArrowLeftRight}
    />
  )
}
