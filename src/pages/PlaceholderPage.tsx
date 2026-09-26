import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'

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
      <Card>
        <EmptyState
          icon={icon}
          title={comingSoonLabel}
          description="This page will be connected to the backend once the API contract is finalised. Navigation and layout are fully functional."
        />
      </Card>
    </>
  )
}
