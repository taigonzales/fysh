import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  width?: string
  height?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

export function Skeleton({ width, height, rounded = 'md', className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-ocean-dark',
        {
          'rounded-none': rounded === 'none',
          'rounded-sm': rounded === 'sm',
          'rounded-md': rounded === 'md',
          'rounded-lg': rounded === 'lg',
          'rounded-full': rounded === 'full',
        },
        className
      )}
      style={{ width, height }}
    />
  )
}
