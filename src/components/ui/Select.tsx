import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder,
  id,
  className = '',
  ...rest
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={[
            'w-full h-11 rounded-xl border bg-white text-sm text-gray-800 appearance-none',
            'border-gray-200 hover:border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            'transition-colors duration-150',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            'pl-3 pr-8',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : '',
            className,
          ].join(' ')}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
