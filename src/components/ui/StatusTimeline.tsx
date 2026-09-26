import { Check, Clock, User as UserIcon } from 'lucide-react'
import type { TimelineMilestone } from '../../types/operations'

interface StatusTimelineProps {
  milestones: TimelineMilestone[]
  currentStatusKey: string
  className?: string
}

/**
 * Reusable horizontal timeline component with connected circular milestones.
 * - Completed steps: purple circle with checkmark.
 * - Current step: white circle with purple outline and animated inner indicator.
 * - Upcoming steps: gray circle.
 * - Connected with horizontal lines (purple for completed progress, gray for upcoming).
 * - Displays timestamps and responsible users under each step.
 */
export function StatusTimeline({
  milestones,
  currentStatusKey,
  className = '',
}: StatusTimelineProps) {
  const currentIndex = milestones.findIndex((m) => m.key === currentStatusKey)

  return (
    <div className={`w-full overflow-x-auto py-3 ${className}`}>
      <div className="min-w-[580px] px-4">
        {/* Horizontal steps bar */}
        <div className="relative flex items-center justify-between">
          {milestones.map((milestone, idx) => {
            const isCompleted = idx < currentIndex
            const isCurrent = idx === currentIndex
            const isUpcoming = idx > currentIndex
            const isLast = idx === milestones.length - 1

            return (
              <div
                key={milestone.key}
                className="relative flex flex-1 items-center last:flex-none"
              >
                {/* Milestone Node */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={[
                      'flex size-10 items-center justify-center rounded-full transition-all duration-300',
                      isCompleted
                        ? 'border-2 border-purple-600 bg-purple-600 text-white shadow-sm'
                        : '',
                      isCurrent
                        ? 'border-2 border-purple-600 bg-white text-purple-600 shadow-md ring-4 ring-purple-100 ring-offset-1'
                        : '',
                      isUpcoming
                        ? 'border-2 border-gray-300 bg-gray-50 text-gray-400'
                        : '',
                    ].join(' ')}
                    title={`Milestone: ${milestone.label} (${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'})`}
                  >
                    {isCompleted && <Check size={18} strokeWidth={2.5} />}
                    {isCurrent && (
                      <span className="size-3 rounded-full bg-purple-600 animate-pulse" />
                    )}
                    {isUpcoming && (
                      <span className="size-2 rounded-full bg-gray-300" />
                    )}
                  </div>
                </div>

                {/* Connecting Line to Next Step */}
                {!isLast && (
                  <div className="relative mx-2 h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'w-full bg-purple-600' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Milestone Metadata Details Grid below the circles */}
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2" style={{ gridTemplateColumns: `repeat(${milestones.length}, minmax(0, 1fr))` }}>
          {milestones.map((milestone, idx) => {
            const isCompleted = idx < currentIndex
            const isCurrent = idx === currentIndex

            return (
              <div
                key={milestone.key}
                className="flex flex-col pr-3"
              >
                {/* Step Name & Status Tag */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-sm font-semibold tracking-tight ${
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {milestone.label}
                  </span>
                  {isCurrent && (
                    <span className="inline-block rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200">
                      Current
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-block rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 border border-green-200">
                      Done
                    </span>
                  )}
                </div>

                {/* Timestamp */}
                <div className="mt-1.5 flex items-center gap-1 text-xs">
                  <Clock
                    size={12}
                    className={
                      milestone.timestamp
                        ? 'text-purple-600 shrink-0'
                        : 'text-gray-300 shrink-0'
                    }
                  />
                  <span
                    className={
                      milestone.timestamp
                        ? 'font-medium text-gray-700'
                        : 'text-gray-400 italic'
                    }
                  >
                    {milestone.timestamp || 'Pending'}
                  </span>
                </div>

                {/* Responsible User */}
                <div className="mt-1 flex items-start gap-1 text-xs">
                  <UserIcon
                    size={12}
                    className={
                      milestone.user
                        ? 'text-purple-600 shrink-0 mt-0.5'
                        : 'text-gray-300 shrink-0 mt-0.5'
                    }
                  />
                  <span
                    className={
                      milestone.user
                        ? 'text-gray-600 leading-snug line-clamp-2'
                        : 'text-gray-400 italic'
                    }
                  >
                    {milestone.user || 'Pending assignment'}
                  </span>
                </div>

                {/* Note / Description if provided */}
                {milestone.description && (
                  <p className="mt-1 text-[11px] text-gray-500 leading-tight">
                    {milestone.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
