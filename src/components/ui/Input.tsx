import type { InputHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leadingIcon?: LucideIcon
}

export function Input({
  label,
  error,
  hint,
  leadingIcon: LeadingIcon,
  id,
  className = '',
  ...rest
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {LeadingIcon && (
          <LeadingIcon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
        <input
          id={id}
          className={[
            'w-full h-11 rounded-xl border bg-white text-sm text-gray-800 placeholder:text-gray-400',
            'border-gray-200 hover:border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            'transition-colors duration-150',
            'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : '',
            LeadingIcon ? 'pl-9 pr-3' : 'px-3',
            className,
          ].join(' ')}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
