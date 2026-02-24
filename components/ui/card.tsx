import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  glowColor?: 'teal' | 'coral' | 'none'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, glowColor = 'none', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-ocean-card border border-border p-4',
          {
            'transition-all hover:shadow-neon-glow-sm': hoverable && glowColor === 'teal',
            'transition-all hover:shadow-[0_0_10px_rgba(255,107,107,0.2)]': hoverable && glowColor === 'coral',
            'transition-all hover:bg-ocean-dark': hoverable && glowColor === 'none',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
