import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
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
        'bg-white rounded-2xl min-w-0',
        border ? 'border border-gray-200/80' : '',
        'shadow-[0_2px_6px_0_rgb(15_23_42/0.025)]',
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
      className={[
        'flex items-center justify-between gap-3 mb-4',
        className,
      ].join(' ')}
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
