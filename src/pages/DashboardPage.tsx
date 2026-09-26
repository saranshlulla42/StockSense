import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  ArrowUpRight,
  Clock3,
  Layers,
  Package,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { dashboardApi, type DashboardData } from '../api/client'

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi
      .getData()
      .then(setData)
      .catch((err) => console.error('Failed to load dashboard data', err))
      .finally(() => setLoading(false))
  }, [])

  const kpis = data?.kpis
  const recentActivities = data?.recent_activity ?? []
  const chartData = data?.chart_data ?? []

  const metrics = [
    {
      label: 'Total products',
      value: kpis ? kpis.total_skus : '—',
      caption: 'Active catalog SKUs',
      icon: Package,
      tone: 'bg-indigo-50 text-indigo-600',
      link: '/products',
    },
    {
      label: 'Inventory value',
      value: kpis ? `$${kpis.total_stock_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
      caption: 'Total on-hand stock cost',
      icon: TrendingUp,
      tone: 'bg-emerald-50 text-emerald-600',
      link: '/products',
    },
    {
      label: 'Receipts to process',
      value: kpis ? kpis.pending_receipts : '—',
      caption: 'Incoming vendor orders',
      icon: ArrowDownToLine,
      tone: 'bg-cyan-50 text-cyan-600',
      link: '/receipts',
    },
    {
      label: 'Deliveries to process',
      value: kpis ? kpis.pending_deliveries : '—',
      caption: 'Outbound customer orders',
      icon: ArrowUpFromLine,
      tone: 'bg-amber-50 text-amber-600',
      link: '/deliveries',
    },
  ]

  const maxChartVal = Math.max(1, ...chartData.map((d) => Math.max(d.inbound, d.outbound)))

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Daily overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            A little more <span className="editorial-accent">clarity.</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your inventory, operations, and intelligence in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {kpis && kpis.low_stock_count > 0 && (
            <Link
              to="/smart-reorder"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <ShieldAlert size={14} className="text-amber-600" />
              {kpis.low_stock_count} item{kpis.low_stock_count > 1 ? 's' : ''} low in stock
            </Link>
          )}
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-500 shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Live workspace
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Link key={metric.label} to={metric.link} className="block group">
            <Card padding="sm" className="sm:p-6 transition-all group-hover:border-indigo-200 group-hover:shadow-md">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-gray-500 group-hover:text-indigo-600 transition-colors">
                  {metric.label}
                </p>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${metric.tone}`}
                >
                  <metric.icon size={17} strokeWidth={1.8} />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-semibold text-slate-900">
                {loading ? '…' : metric.value}
              </p>
              <p className="mt-2 text-[11px] text-gray-400">{metric.caption}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Charts & Quick Links Section */}
      <div className="mb-7 grid items-stretch gap-5 xl:grid-cols-[1.65fr_1fr]">
        {/* 7-day Movement Graph */}
        <Card padding="none" className="overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Stock movement (Last 7 days)
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Inbound receipts vs outbound deliveries
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-cyan-600">
                <span className="size-2 rounded-full bg-cyan-500" /> Inbound
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="size-2 rounded-full bg-amber-500" /> Outbound
              </span>
            </div>
          </div>

          <div className="flex-1 px-6 py-6 flex flex-col justify-end">
            <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-44 border-b border-gray-100 pb-2">
              {chartData.map((point) => {
                const inHeight = Math.max(8, Math.round((point.inbound / maxChartVal) * 100))
                const outHeight = Math.max(8, Math.round((point.outbound / maxChartVal) * 100))
                return (
                  <div key={point.label} className="flex flex-col items-center gap-2 h-full justify-end">
                    <div className="flex items-end gap-1 sm:gap-2 h-full">
                      <div
                        style={{ height: `${inHeight}%` }}
                        title={`Inbound: ${point.inbound} units`}
                        className="w-3 sm:w-5 bg-cyan-500 rounded-t transition-all hover:opacity-80"
                      />
                      <div
                        style={{ height: `${outHeight}%` }}
                        title={`Outbound: ${point.outbound} units`}
                        className="w-3 sm:w-5 bg-amber-500 rounded-t transition-all hover:opacity-80"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-gray-400">
                      {point.label}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <span>Recorded transaction volume</span>
              <Link to="/move-history" className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Full move history <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </Card>

        {/* Quick Operations Links */}
        <Card padding="none">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Quick operations
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Direct access to common workflows
            </p>
          </div>
          <div className="divide-y divide-gray-100 px-6">
            {[
              {
                icon: ArrowDownToLine,
                label: 'Inbound receipts',
                caption: 'Process vendor intake manifests',
                path: '/receipts',
                badge: kpis?.pending_receipts ? `${kpis.pending_receipts} pending` : undefined,
              },
              {
                icon: ArrowUpFromLine,
                label: 'Outbound deliveries',
                caption: 'Pack and dispatch customer orders',
                path: '/deliveries',
                badge: kpis?.pending_deliveries ? `${kpis.pending_deliveries} pending` : undefined,
              },
              {
                icon: Layers,
                label: 'Stock by location',
                caption: 'View on-hand counts across warehouses',
                path: '/locations',
              },
              {
                icon: ShieldAlert,
                label: 'Action center',
                caption: 'Resolve inventory alerts and blockers',
                path: '/action-center',
              },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-center gap-3 py-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <item.icon size={17} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                      {item.label}
                    </p>
                    {item.badge && (
                      <Badge variant="default" className="text-[10px] py-0 px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {item.caption}
                  </p>
                </div>
                <ArrowUpRight
                  size={15}
                  className="ml-auto shrink-0 text-gray-300 group-hover:text-indigo-500 transition-colors"
                />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity & Health Section */}
      <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
        {/* Recent Activity List */}
        <Card padding="none">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent operation activity
            </h2>
            <Link
              to="/move-history"
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <Clock3 size={25} strokeWidth={1.4} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-600">
                No recent activity recorded
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 px-6">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between py-3.5 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold uppercase">
                      {act.type.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {act.reference}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {act.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      act.status === 'done'
                        ? 'success'
                        : act.status === 'waiting'
                          ? 'warning'
                          : 'default'
                    }
                    dot
                  >
                    {act.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Intelligence health highlight */}
        <div className="flex flex-col gap-5">
          <Card className="flex-1 bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <ShieldCheck size={18} />
                </span>
                <h2 className="text-sm font-semibold text-slate-900">
                  Smart intelligence
                </h2>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-xs leading-6 text-gray-600 mb-4">
              Continuous stock health scoring, automatic run-rate analysis, and predictive supplier reorder triggers.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <Link
                to="/inventory-health"
                className="flex flex-col p-2.5 rounded-lg bg-white border border-gray-100 hover:border-indigo-200 transition-colors"
              >
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Health audit</span>
                <span className="text-xs font-semibold text-indigo-600 mt-1 flex items-center gap-1">
                  Analyze <ArrowRight size={12} />
                </span>
              </Link>
              <Link
                to="/smart-reorder"
                className="flex flex-col p-2.5 rounded-lg bg-white border border-gray-100 hover:border-indigo-200 transition-colors"
              >
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Reorder engine</span>
                <span className="text-xs font-semibold text-indigo-600 mt-1 flex items-center gap-1">
                  Suggestions <ArrowRight size={12} />
                </span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
