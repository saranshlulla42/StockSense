import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import {
  intelligenceApi,
  operationsApi,
  warehousesApi,
  type SmartReorderSuggestion,
  isApiError,
} from '../api/client'

export function SmartReorderPage() {
  const [suggestions, setSuggestions] = useState<SmartReorderSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [orderingId, setOrderingId] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function fetchSuggestions() {
    setLoading(true)
    intelligenceApi
      .getReorderSuggestions()
      .then(setSuggestions)
      .catch((err) => console.error('Failed to load suggestions', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  async function handleAutoCreateReceipt(sug: SmartReorderSuggestion) {
    setOrderingId(sug.product_id)
    setErrorMsg(null)
    try {
      const locs = await warehousesApi.listLocations()
      const destLocId = locs[0]?.id

      await operationsApi.create({
        type: 'receipt',
        contact_name: `Smart Reorder PO: ${sug.name}`,
        destination_location_id: destLocId,
        lines: [
          {
            product_id: sug.product_id,
            quantity: sug.suggested_order_qty,
          },
        ],
      })
      setSuccessMsg(
        `Purchase order created for ${sug.suggested_order_qty} units of ${sug.name}! View in Receipts.`
      )
      setTimeout(() => setSuccessMsg(null), 5000)
      fetchSuggestions()
    } catch (err) {
      setErrorMsg(isApiError(err) ? err.message : 'Failed to generate reorder PO.')
    } finally {
      setOrderingId(null)
    }
  }

  const columns = [
    {
      key: 'product',
      header: 'Product / SKU',
      cell: (sug: SmartReorderSuggestion) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{sug.name}</p>
          <p className="text-[10px] font-mono text-gray-400">{sug.sku} · {sug.category}</p>
        </div>
      ),
    },
    {
      key: 'current_stock',
      header: 'Current Stock',
      className: 'text-right',
      cell: (sug: SmartReorderSuggestion) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">{sug.current_stock}</span>
          <span className="text-[10px] text-gray-400 block">Threshold: {sug.reorder_level}</span>
        </div>
      ),
    },
    {
      key: 'runaway',
      header: 'Days to Stockout',
      className: 'text-right',
      cell: (sug: SmartReorderSuggestion) => (
        <span
          className={`font-semibold text-xs ${sug.days_until_stockout <= 3 ? 'text-rose-600' : 'text-amber-600'
            }`}
        >
          {sug.days_until_stockout === 0 ? 'Stocked out' : `${sug.days_until_stockout} days`}
        </span>
      ),
    },
    {
      key: 'lead_time',
      header: 'Supplier Lead Time',
      className: 'text-right',
      cell: (sug: SmartReorderSuggestion) => (
        <span className="text-xs text-gray-600">{sug.lead_time_days} days</span>
      ),
    },
    {
      key: 'suggested_qty',
      header: 'Suggested Order Qty',
      className: 'text-right',
      cell: (sug: SmartReorderSuggestion) => (
        <div>
          <span className="font-mono font-bold text-xs text-indigo-600">
            {sug.suggested_order_qty} units
          </span>
          <span className="text-[10px] text-gray-400 block font-mono">
            Est. ${sug.estimated_cost.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      key: 'urgency',
      header: 'Urgency',
      cell: (sug: SmartReorderSuggestion) => {
        if (sug.urgency === 'critical') {
          return <Badge variant="danger" dot>Critical Risk</Badge>
        }
        if (sug.urgency === 'high') {
          return <Badge variant="warning" dot>High Priority</Badge>
        }
        return <Badge variant="default" dot>Medium</Badge>
      },
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      cell: (sug: SmartReorderSuggestion) => (
        <Button
          size="sm"
          onClick={() => handleAutoCreateReceipt(sug)}
          loading={orderingId === sug.product_id}
        >
          <ShoppingCart size={13} className="mr-1.5" />
          Create Inbound PO
        </Button>
      ),
    },
  ]

  const totalReorderCost = suggestions.reduce((acc, s) => acc + s.estimated_cost, 0)

  return (
    <>
      <PageHeader
        title="Smart Reorder Engine"
        description="Predictive inventory replenishment engine analyzing daily consumption run rates and supplier lead times."
      />

      {successMsg && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <Link to="/receipts" className="text-xs font-semibold text-emerald-700 hover:underline">
            View Receipts →
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary Banner */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card padding="sm">
          <p className="text-xs text-gray-500 font-medium">Reorder Triggers Active</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{suggestions.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Products below safety buffer</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-gray-500 font-medium">Estimated Purchase Budget</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${totalReorderCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Across all suggested quantities</p>
        </Card>
        <Card padding="sm" className="flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Automation</p>
            <p className="text-sm font-semibold text-indigo-600 mt-1 flex items-center gap-1">
              <Sparkles size={15} /> One-click PO generation
            </p>
          </div>
          <p className="text-[11px] text-gray-400">Creates draft receipts in your operations ledger</p>
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden">
        {suggestions.length === 0 && !loading ? (
          <EmptyState
            icon={Sparkles}
            title="All stock levels are optimal"
            description="No items currently breach reorder thresholds or lead time runaway windows."
          />
        ) : (
          <Table
            columns={columns}
            data={suggestions}
            keyExtractor={(s) => s.product_id}
            loading={loading}
          />
        )}
      </Card>
    </>
  )
}
