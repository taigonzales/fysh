'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'rounded-full bg-ocean-dark border border-border flex items-center justify-center overflow-hidden',
        {
          'h-8 w-8 text-xs': size === 'sm',
          'h-10 w-10 text-sm': size === 'md',
          'h-12 w-12 text-base': size === 'lg',
          'h-16 w-16 text-lg': size === 'xl',
        },
        className
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : initials ? (
        <span className="font-semibold text-neon-teal">{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-text-muted" />
      )}
    </div>
  )
}
