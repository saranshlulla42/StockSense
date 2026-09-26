import { ArrowDownToLine } from 'lucide-react'
import { PlaceholderPage } from './PlaceholderPage'

/**
 * Receipts page — incoming stock from vendors.
 * TODO: Connect to backend Receipts API after contract is finalised.
 */
export function ReceiptsPage() {
  return (
    <PlaceholderPage
      title="Receipts"
      description="Track incoming stock receipts from vendors and suppliers."
      icon={ArrowDownToLine}
    />
  )
}
