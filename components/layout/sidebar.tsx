'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Target, Users, Trophy, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Picks', href: '/dashboard/picks', icon: Target },
  { name: 'Bet Tracker', href: '/dashboard/tracker', icon: TrendingUp },
  { name: 'Following', href: '/dashboard/following', icon: Users },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-64 border-r border-border bg-ocean-dark min-h-screen">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-neon-teal/10 text-neon-teal border-l-2 border-neon-teal'
                  : 'text-text-secondary hover:bg-ocean-card hover:text-text-primary'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
