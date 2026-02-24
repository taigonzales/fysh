import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'info' | 'warning' | 'neutral'
  size?: 'sm' | 'md'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          {
            'bg-positive/10 text-positive border border-positive/20': variant === 'success',
            'bg-negative/10 text-negative border border-negative/20': variant === 'danger',
            'bg-neon-teal/10 text-neon-teal border border-neon-teal/20': variant === 'info',
            'bg-coral/10 text-coral border border-coral/20': variant === 'warning',
            'bg-text-muted/10 text-text-secondary border border-text-muted/20': variant === 'neutral',
          },
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-3 py-1 text-sm': size === 'md',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
