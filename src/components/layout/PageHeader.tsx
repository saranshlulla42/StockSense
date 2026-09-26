import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

/**
 * Standard page header used at the top of every page.
 * Contains the page title, optional description, and optional action buttons.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start sm:items-center justify-between mb-8 gap-4 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-[28px] tracking-tight font-semibold text-gray-900 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-6 text-gray-500 mt-2 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  )
}
