import { useEffect, useState } from 'react'
import { Package, Plus, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { productsApi, type Product, type ProductCreatePayload, isApiError } from '../api/client'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [form, setForm] = useState<ProductCreatePayload>({
    sku: '',
    name: '',
    category: 'General',
    unit_of_measure: 'unit',
    per_unit_cost: 0,
    reorder_level: 10,
    avg_daily_usage: 1,
    lead_time_days: 3,
  })

  function fetchProducts() {
    setLoading(true)
    productsApi
      .list({ search: search || undefined, category: category !== 'All' ? category : undefined })
      .then(setProducts)
      .catch((err) => console.error('Failed to fetch products', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
  }, [category])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchProducts()
  }

  function handleOpenModal() {
    setForm({
      sku: '',
      name: '',
      category: 'General',
      unit_of_measure: 'unit',
      per_unit_cost: 0,
      reorder_level: 10,
      avg_daily_usage: 1,
      lead_time_days: 3,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      await productsApi.create({
        ...form,
        per_unit_cost: Number(form.per_unit_cost),
        reorder_level: Number(form.reorder_level),
        avg_daily_usage: Number(form.avg_daily_usage || 0),
        lead_time_days: Number(form.lead_time_days || 0),
      })
      setIsModalOpen(false)
      setSuccessMsg(`Product ${form.sku} created successfully!`)
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchProducts()
    } catch (err) {
      setFormError(isApiError(err) ? err.message : 'Failed to create product.')
    } finally {
      setSubmitting(false)
    }
  }

  // Get distinct categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category || 'General')))]

  const columns = [
    {
      key: 'product',
      header: 'Product / SKU',
      cell: (p: Product) => (
        <div>
          <p className="font-semibold text-slate-800">{p.name}</p>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{p.sku}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (p: Product) => (
        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-medium">
          {p.category || 'General'}
        </span>
      ),
    },
    {
      key: 'cost',
      header: 'Unit Cost',
      cell: (p: Product) => (
        <span className="text-gray-700 font-mono text-xs">
          ${p.per_unit_cost.toFixed(2)} / {p.unit_of_measure}
        </span>
      ),
    },
    {
      key: 'reorder',
      header: 'Reorder Level',
      cell: (p: Product) => (
        <span className="text-xs text-gray-600 font-medium">
          {p.reorder_level} {p.unit_of_measure}
        </span>
      ),
    },
    {
      key: 'on_hand',
      header: 'On Hand',
      className: 'text-right',
      cell: (p: Product) => (
        <span className="font-semibold text-slate-900">
          {p.on_hand} {p.unit_of_measure}
        </span>
      ),
    },
    {
      key: 'free_to_use',
      header: 'Free to Use',
      className: 'text-right',
      cell: (p: Product) => (
        <span className="text-xs font-medium text-emerald-600">
          {p.free_to_use} {p.unit_of_measure}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Stock Status',
      className: 'text-right',
      cell: (p: Product) => {
        if (p.on_hand === 0) {
          return <Badge variant="danger" dot>Out of stock</Badge>
        }
        if (p.on_hand <= p.reorder_level) {
          return <Badge variant="warning" dot>Low stock</Badge>
        }
        return <Badge variant="success" dot>Healthy</Badge>
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your product catalogue, pricing, and reorder levels."
        actions={
          <Button size="sm" onClick={handleOpenModal} id="products-add">
            <Plus size={14} className="mr-1.5" />
            Add Product
          </Button>
        }
      />

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU or name…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        {products.length === 0 && !loading ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Add your first SKU to get started with inventory tracking."
            action={
              <Button size="sm" onClick={handleOpenModal}>
                <Plus size={14} className="mr-1" /> Add Product
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={products}
            keyExtractor={(p) => p.id}
            loading={loading}
          />
        )}
      </Card>

      {/* Add Product Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Product"
        size="md"
      >
        {formError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <AlertCircle size={14} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              id="sku"
              required
              placeholder="e.g. RAW-STL-002"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <Input
              label="Product Name"
              id="name"
              required
              placeholder="e.g. Aluminum Bars 20mm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              id="category"
              placeholder="e.g. Raw Materials"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Input
              label="Unit of Measure"
              id="uom"
              placeholder="e.g. unit, m, box, kg"
              value={form.unit_of_measure}
              onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unit Cost ($)"
              id="cost"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.per_unit_cost}
              onChange={(e) => setForm({ ...form, per_unit_cost: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Reorder Threshold"
              id="reorder"
              type="number"
              min="0"
              required
              value={form.reorder_level}
              onChange={(e) => setForm({ ...form, reorder_level: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Avg Daily Usage"
              id="daily_usage"
              type="number"
              min="0"
              value={form.avg_daily_usage}
              onChange={(e) => setForm({ ...form, avg_daily_usage: parseFloat(e.target.value) || 0 })}
              hint="Feeds smart reorder calculations"
            />
            <Input
              label="Supplier Lead Time (Days)"
              id="lead_time"
              type="number"
              min="0"
              value={form.lead_time_days}
              onChange={(e) => setForm({ ...form, lead_time_days: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
