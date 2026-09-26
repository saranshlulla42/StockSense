import { Package, Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'

/**
 * Products page — foundation placeholder.
 * TODO: Connect to backend Product API after contract is finalised.
 */
export function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your product catalogue and stock units."
        actions={
          <Button
            size="sm"
            id="products-add"
            disabled
            title="Product creation is not available in this preview"
          >
            <Plus size={13} />
            Add Product
          </Button>
        }
      />
      <Card padding="none" className="overflow-hidden">
        <div className="grid grid-cols-3 gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          <span>Product / SKU</span>
          <span className="text-right">On hand</span>
          <span className="text-right">Available</span>
        </div>
        <EmptyState
          icon={Package}
          title="Your catalog starts here"
          description="A clear view of every product, unit, and stock level. Product management is coming to this workspace soon."
        />
      </Card>
    </>
  )
}
