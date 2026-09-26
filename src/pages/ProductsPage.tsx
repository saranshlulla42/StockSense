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
          <Button size="sm" id="products-add">
            <Plus size={13} />
            Add Product
          </Button>
        }
      />
      <Card>
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Products will be listed here once connected to the backend. Use the button above to add your first product."
        />
      </Card>
    </>
  )
}
