import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Activity,
  RefreshCw,
  BarChart3,
} from 'lucide-react'

/**
 * Dashboard page — foundation layout.
 *
 * TODO: Replace stat cards and tables with real data from backend API once
 *       the API contract is finalised. Do NOT hardcode inventory numbers.
 */
export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Inventory overview and operational summary."
        actions={
          <Button variant="secondary" size="sm" id="dashboard-refresh">
            <RefreshCw size={13} />
            Refresh
          </Button>
        }
      />

      {/* KPI cards skeleton — will be wired to real API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.id} padding="md">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {kpi.label}
              </p>
              <div
                className={[
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  kpi.iconBg,
                ].join(' ')}
              >
                <kpi.icon size={15} className={kpi.iconColor} />
              </div>
            </div>
            {/* TODO: Replace placeholder with real backend value. */}
            <div className="h-7 w-24 rounded bg-gray-100 animate-pulse mb-1" />
            <p className="text-xs text-gray-400">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* Lower section: two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <Card className="lg:col-span-2" padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle>Recent Activity</CardTitle>
            <Badge variant="neutral" className="text-xs">
              Live
            </Badge>
          </CardHeader>
          <div className="px-5 pb-5">
            {/* TODO: Replace with real recent operations feed from backend. */}
            <EmptyState
              icon={Activity}
              title="Activity feed will appear here"
              description="Recent receipts, deliveries, and transfers will be displayed once the backend is connected."
            />
          </div>
        </Card>

        {/* Alerts */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle>Alerts</CardTitle>
            <Badge variant="warning" dot>
              Pending
            </Badge>
          </CardHeader>
          <div className="px-5 pb-5">
            {/* TODO: Replace with real inventory alerts from backend. */}
            <EmptyState
              icon={AlertTriangle}
              title="No alerts configured"
              description="Stock alerts and reorder triggers will appear here after backend integration."
            />
          </div>
        </Card>
      </div>
    </>
  )
}

// ─── KPI card config (no real values — only structure) ──────────────────────
const kpiCards = [
  {
    id: 'total-products',
    label: 'Total Products',
    sub: 'Across all warehouses',
    icon: Package,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'stock-value',
    label: 'Stock Value',
    sub: 'Estimated valuation',
    icon: TrendingUp,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    id: 'low-stock',
    label: 'Low Stock Items',
    sub: 'Require attention',
    icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'pending-operations',
    label: 'Pending Operations',
    sub: 'Awaiting confirmation',
    icon: BarChart3,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
]
