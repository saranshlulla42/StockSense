interface LoadingStateProps {
  message?: string
  rows?: number
}

export function LoadingState({
  message = 'Loading...',
  rows = 5,
}: LoadingStateProps) {
  return (
    <div className="flex flex-col gap-3 py-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="h-8 w-8 rounded bg-gray-200 flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 w-2/5 rounded bg-gray-200" />
            <div className="h-2.5 w-1/3 rounded bg-gray-100" />
          </div>
          <div className="h-3 w-16 rounded bg-gray-200" />
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center mt-2">{message}</p>
    </div>
  )
}

export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <svg
        className="animate-spin text-indigo-600"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  )
}
