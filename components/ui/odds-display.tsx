import { cn } from '@/lib/utils/cn'

interface OddsDisplayProps {
  odds: number
  size?: 'sm' | 'md' | 'lg'
  showSign?: boolean
  className?: string
}

export function OddsDisplay({ odds, size = 'md', showSign = true, className }: OddsDisplayProps) {
  const isPositive = odds > 0
  const formattedOdds = showSign && isPositive ? `+${odds}` : odds.toString()

  return (
    <span
      className={cn(
        'font-mono font-semibold',
        isPositive ? 'text-positive' : 'text-text-primary',
        {
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg',
        },
        className
      )}
    >
      {formattedOdds}
    </span>
  )
}
