'use client'

import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface NotificationBellProps {
  unreadCount?: number
  onClick?: () => void
}

export function NotificationBell({ unreadCount = 0, onClick }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-ocean-card rounded-lg transition-colors"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-text-secondary" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
