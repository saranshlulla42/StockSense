import { Zap } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Action Center page — prioritised list of inventory actions requiring attention.
 * TODO: Connect to backend Action Center API after contract is finalised.
 */
export function ActionCenterPage() {
  return (
    <PlaceholderPage
      title="Action Center"
      description="Prioritised list of inventory actions requiring immediate attention."
      icon={Zap}
    />
  )
}
