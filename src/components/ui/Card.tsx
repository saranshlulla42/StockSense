import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  padding = 'md',
  border = true,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-lg',
        border ? 'border border-gray-200' : '',
        'shadow-sm',
        paddingStyles[padding],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['flex items-center justify-between mb-4', className].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={['text-sm font-semibold text-gray-800', className].join(' ')}
      {...rest}
    >
      {children}
    </h3>
  )
}
