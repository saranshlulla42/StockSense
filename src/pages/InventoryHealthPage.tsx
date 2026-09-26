import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { intelligenceApi, type InventoryHealthData, type HealthCategoryItem } from '../api/client'

export function InventoryHealthPage() {
  const [data, setData] = useState<InventoryHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    intelligenceApi
      .getHealth()
      .then(setData)
      .catch((err) => console.error('Failed to load health analytics', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = (data?.items ?? []).filter((item) => {
    if (statusFilter === 'All') return true
    return item.health_status === statusFilter
  })

  const columns = [
    {
      key: 'product',
      header: 'Product / SKU',
      cell: (item: HealthCategoryItem) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{item.name}</p>
          <p className="text-[10px] font-mono text-gray-400">{item.sku} · {item.category}</p>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'On Hand',
      className: 'text-right',
      cell: (item: HealthCategoryItem) => (
        <span className="font-semibold text-slate-900 text-xs">{item.current_stock}</span>
      ),
    },
    {
      key: 'reorder',
      header: 'Reorder Level',
      className: 'text-right',
      cell: (item: HealthCategoryItem) => (
        <span className="text-gray-600 text-xs">{item.reorder_level}</span>
      ),
    },
    {
      key: 'usage',
      header: 'Daily Run Rate',
      className: 'text-right',
      cell: (item: HealthCategoryItem) => (
        <span className="text-gray-600 text-xs">{item.avg_daily_usage} / day</span>
      ),
    },
    {
      key: 'days_stock',
      header: 'Estimated Runaway',
      className: 'text-right',
      cell: (item: HealthCategoryItem) => (
        <span
          className={`font-semibold text-xs ${item.days_of_stock <= 5
            ? 'text-rose-600'
            : item.days_of_stock <= 15
              ? 'text-amber-600'
              : 'text-emerald-600'
            }`}
        >
          {item.days_of_stock > 365 ? '> 1 year' : `${item.days_of_stock} days`}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Health Assessment',
      className: 'text-right',
      cell: (item: HealthCategoryItem) => {
        if (item.health_status === 'out_of_stock') {
          return <Badge variant="danger" dot>Stockout</Badge>
        }
        if (item.health_status === 'low_stock') {
          return <Badge variant="warning" dot>Low Stock</Badge>
        }
        if (item.health_status === 'overstocked') {
          return <Badge variant="info" dot>Overstocked</Badge>
        }
        return <Badge variant="success" dot>Optimal</Badge>
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Inventory Health"
        description="Comprehensive diagnostic audit of stock velocity, stockout risks, and inventory efficiency."
      />

      {/* Health Score Banner & Breakdown Cards */}
      <div className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Score Card */}
        <Card padding="md" className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              System Health Score
            </span>
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-white">
              {data ? data.health_score : '—'}
            </span>
            <span className="text-lg text-indigo-300 font-semibold">/ 100</span>
          </div>
          <p className="mt-3 text-xs text-indigo-200 leading-relaxed">
            {data && data.health_score >= 80
              ? 'Inventory levels are in a healthy, optimized state across active SKUs.'
              : 'Attention needed on out-of-stock and low-velocity products.'}
          </p>
        </Card>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3 lg:col-span-3">
          <Card padding="sm" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">Optimal SKUs</span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={16} />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{data?.optimal_count ?? 0}</p>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Within target safety buffer</p>
          </Card>

          <Card padding="sm" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">Low / Stockout</span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle size={16} />
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {(data?.low_stock_count ?? 0) + (data?.out_of_stock_count ?? 0)}
              </p>
            </div>
            <Link
              to="/smart-reorder"
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
            >
              Reorder now <ArrowRight size={11} />
            </Link>
          </Card>

          <Card padding="sm" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">Overstocked</span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Layers size={16} />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{data?.overstocked_count ?? 0}</p>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">&gt; 60 days of stock on hand</p>
          </Card>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-5 flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { label: 'All Items', value: 'All' },
          { label: 'Optimal', value: 'optimal' },
          { label: 'Low Stock', value: 'low_stock' },
          { label: 'Stockout', value: 'out_of_stock' },
          { label: 'Overstocked', value: 'overstocked' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === tab.value
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items Health Table */}
      <Card padding="none" className="overflow-hidden">
        <Table
          columns={columns}
          data={filteredItems}
          keyExtractor={(item) => item.product_id}
          loading={loading}
        />
      </Card>
    </>
  )
}
