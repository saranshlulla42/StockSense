import { Link } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  ArrowUpRight,
  BarChart3,
  CircleHelp,
  Clock3,
  Layers,
  Package,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Card } from '../components/ui/Card'

const metrics = [
  {
    label: 'Total products',
    caption: 'Across your catalog',
    icon: Package,
    tone: 'bg-indigo-50 text-indigo-600',
  },
  {
    label: 'Inventory value',
    caption: 'Based on unit costs',
    icon: TrendingUp,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Receipts to process',
    caption: 'Incoming inventory',
    icon: ArrowDownToLine,
    tone: 'bg-cyan-50 text-cyan-600',
  },
  {
    label: 'Deliveries to process',
    caption: 'Outgoing inventory',
    icon: ArrowUpFromLine,
    tone: 'bg-amber-50 text-amber-600',
  },
]

export function DashboardPage() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Your daily overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            A little more <span className="editorial-accent">clarity.</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your inventory, operations, and next steps. All in one place.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-500">
          <span className="size-1.5 rounded-full bg-amber-400" />
          Workspace preview
        </span>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} padding="sm" className="sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-gray-500">
                {metric.label}
              </p>
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${metric.tone}`}
              >
                <metric.icon size={17} strokeWidth={1.8} />
              </span>
            </div>
            <p
              className="text-3xl font-semibold text-gray-300"
              aria-label="Data not available"
            >
              —
            </p>
            <p className="mt-3 text-[11px] text-gray-400">{metric.caption}</p>
          </Card>
        ))}
      </div>

      <div className="mb-7 grid items-stretch gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Stock movement
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                The rhythm of your inventory
              </p>
            </div>
            <BarChart3 size={18} className="text-indigo-400" />
          </div>
          <div className="relative flex min-h-60 items-center justify-center px-6 py-10">
            <div
              className="pointer-events-none absolute inset-6 bg-[repeating-linear-gradient(to_top,transparent,transparent_43px,#f3f4f6_44px)]"
              aria-hidden="true"
            />
            <div className="relative max-w-xs bg-white/90 px-5 py-4 text-center">
              <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                <TrendingUp size={21} />
              </span>
              <h3 className="text-sm font-semibold text-gray-800">
                Your stock story starts here
              </h3>
              <p className="mt-2 text-xs leading-6 text-gray-500">
                Incoming and outgoing stock will appear here when inventory data
                is available.
              </p>
            </div>
          </div>
        </Card>
        <Card padding="none">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Make yourself at home
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              A few good places to start
            </p>
          </div>
          <div className="divide-y divide-gray-100 px-6">
            {[
              {
                icon: Layers,
                label: 'Organize your warehouses',
                caption: 'Give every product a place',
                path: '/warehouses',
              },
              {
                icon: Package,
                label: 'Explore your product catalog',
                caption: 'Keep the essentials together',
                path: '/products',
              },
              {
                icon: ArrowDownToLine,
                label: 'Review incoming stock',
                caption: 'Follow receipts from start to finish',
                path: '/receipts',
              },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-center gap-3 py-5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <item.icon size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {item.caption}
                  </p>
                </div>
                <ArrowUpRight
                  size={15}
                  className="ml-auto shrink-0 text-gray-300 group-hover:text-indigo-500"
                />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
        <Card padding="none">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent activity
            </h2>
            <Link
              to="/move-history"
              className="flex items-center gap-1 text-xs font-medium text-indigo-600"
            >
              View history <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Clock3 size={25} strokeWidth={1.4} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-600">
              A home for every movement
            </p>
            <p className="max-w-xs text-xs leading-6 text-gray-400">
              Receipts, deliveries, and transfers will form your activity
              timeline.
            </p>
          </div>
        </Card>
        <div className="flex flex-col gap-5">
          <Card className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <ShieldCheck size={18} />
              </span>
              <h2 className="text-sm font-semibold text-slate-900">
                Inventory health
              </h2>
            </div>
            <p className="text-xs leading-6 text-gray-500">
              Keep an eye on low stock and items that need attention as your
              inventory grows.
            </p>
            <Link
              to="/inventory-health"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600"
            >
              Explore inventory health <ArrowRight size={13} />
            </Link>
          </Card>
          <div className="flex items-start gap-3 px-2 text-gray-400">
            <CircleHelp size={16} className="mt-0.5 shrink-0" />
            <p className="text-[11px] leading-5">
              This workspace is a preview. Inventory totals will appear when
              your data is connected.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
