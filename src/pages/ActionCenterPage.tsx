import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { intelligenceApi, type ActionItem } from '../api/client'

export function ActionCenterPage() {
  const [actions, setActions] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    intelligenceApi
      .getActionCenter()
      .then(setActions)
      .catch((err) => console.error('Failed to load action center', err))
      .finally(() => setLoading(false))
  }, [])

  const criticalCount = actions.filter((a) => a.urgency === 'critical').length
  const warningCount = actions.filter((a) => a.urgency === 'warning').length

  return (
    <>
      <PageHeader
        title="Action Center"
        description="Unified operational queue of high-priority inventory alerts, delayed shipments, and pending authorizations."
      />

      {/* Summary status banner */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card padding="sm" className="border-rose-100 bg-rose-50/40">
          <p className="text-xs text-rose-700 font-medium">Critical Attention Items</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{criticalCount}</p>
          <p className="text-[11px] text-rose-500 mt-0.5">Stockouts and overdue shipments</p>
        </Card>

        <Card padding="sm" className="border-amber-100 bg-amber-50/40">
          <p className="text-xs text-amber-700 font-medium">Warnings & Blockers</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{warningCount}</p>
          <p className="text-[11px] text-amber-500 mt-0.5">Low inventory and waiting operations</p>
        </Card>

        <Card padding="sm">
          <p className="text-xs text-gray-500 font-medium">Total Queue Items</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{actions.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Requires operator resolution</p>
        </Card>
      </div>

      {/* Action Items List */}
      {actions.length === 0 && !loading ? (
        <Card padding="none">
          <EmptyState
            icon={ShieldCheck}
            title="All operations are clear"
            description="There are no pending blockers, delayed deliveries, or critical stockouts."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {actions.map((item) => {
            const isCritical = item.urgency === 'critical'
            const isWarning = item.urgency === 'warning'

            return (
              <Card
                key={item.id}
                padding="md"
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-sm ${isCritical
                  ? 'border-rose-200/80 bg-white'
                  : isWarning
                    ? 'border-amber-200/80 bg-white'
                    : 'border-gray-200 bg-white'
                  }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl mt-0.5 ${isCritical
                      ? 'bg-rose-100 text-rose-700'
                      : isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}
                  >
                    {isCritical ? (
                      <AlertCircle size={18} />
                    ) : isWarning ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <ArrowDownToLine size={18} />
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <Badge
                        variant={
                          isCritical ? 'danger' : isWarning ? 'warning' : 'info'
                        }
                        dot
                      >
                        {item.urgency}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link to={item.route_target}>
                    <Button size="sm" variant={isCritical ? 'primary' : 'secondary'}>
                      {item.action_label}
                      <ArrowRight size={13} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
