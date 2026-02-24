'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-teal focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-deep',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-neon-teal text-ocean-deep hover:bg-neon-teal-muted shadow-neon-glow-sm hover:shadow-neon-glow': variant === 'primary',
            'border-2 border-neon-teal text-neon-teal hover:bg-neon-teal/10': variant === 'secondary',
            'hover:bg-ocean-card text-text-primary': variant === 'ghost',
            'bg-negative text-white hover:bg-negative/90': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
