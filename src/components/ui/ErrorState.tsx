import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  action?: ReactNode
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
