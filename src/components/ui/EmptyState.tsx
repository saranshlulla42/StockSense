import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 ring-8 ring-indigo-50/40 flex items-center justify-center mb-6">
        <Icon size={26} strokeWidth={1.5} className="text-indigo-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm leading-6 text-gray-500 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
