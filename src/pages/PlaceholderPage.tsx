import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock3 } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  icon?: LucideIcon
  comingSoonLabel?: string
}

/**
 * Reusable placeholder for pages that are not yet implemented.
 * Will be replaced with full page content after backend API contract is finalised.
 *
 * TODO: Replace this with real page content after backend API contract is finalised.
 */
export function PlaceholderPage({
  title,
  description,
  icon,
  comingSoonLabel = 'This section is under development.',
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/40 px-6 py-4">
          <span className="text-xs font-medium text-gray-500">
            {title} workspace
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-600">
            <Clock3 size={12} />
            Coming soon
          </span>
        </div>
        <EmptyState
          icon={icon}
          title={comingSoonLabel}
          description="We're preparing this workspace. In the meantime, explore your dashboard and the rest of StockSense."
          action={
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft size={14} />
              Back to overview
            </Link>
          }
        />
      </Card>
    </>
  )
}
