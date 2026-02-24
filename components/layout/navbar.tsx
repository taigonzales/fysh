'use client'

import Link from 'next/link'
import { Fish, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/ui/notification-bell'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-ocean-deep/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Fish className="h-8 w-8 text-neon-teal" />
            <span className="text-2xl font-bold text-text-primary">FYSH</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/picks" className="text-text-secondary hover:text-text-primary transition-colors">
              Picks
            </Link>
            <Link href="/props" className="text-text-secondary hover:text-text-primary transition-colors">
              Props
            </Link>
            <Link href="/leaderboard" className="text-text-secondary hover:text-text-primary transition-colors">
              Leaderboard
            </Link>
            <Link href="/tracker" className="text-text-secondary hover:text-text-primary transition-colors">
              Tracker
            </Link>
          </div>

          {/* Auth & Notifications */}
          <div className="flex items-center gap-3">
            <NotificationBell unreadCount={0} />
            <Button variant="secondary" size="sm">
              Login
            </Button>
            <Button variant="primary" size="sm">
              Sign Up
            </Button>
            <button className="md:hidden p-2" aria-label="Menu">
              <Menu className="h-6 w-6 text-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
