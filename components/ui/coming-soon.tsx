'use client'

import { Fish, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ComingSoonProps {
  title: string
  description: string
  features?: string[]
}

export function ComingSoon({ title, description, features }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-ocean-deep via-ocean-mid to-ocean-deep px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated Fish Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <Fish className="h-24 w-24 text-neon-teal animate-pulse" />
            <div className="absolute inset-0 bg-neon-teal/20 blur-xl rounded-full" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-text-primary">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary font-light">
            {description}
          </p>
        </div>

        {/* Features Preview (if provided) */}
        {features && features.length > 0 && (
          <div className="bg-ocean-light/30 border border-border rounded-xl p-6 backdrop-blur">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Coming Features:
            </h3>
            <ul className="space-y-2 text-text-secondary">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-teal" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Waitlist CTA */}
        <div className="space-y-4">
          <p className="text-text-secondary">
            Join the waitlist to get early access when we launch
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/#waitlist">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Join Waitlist
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-text-secondary">
            Building something special... Check back soon 🎣
          </p>
        </div>
      </div>
    </div>
  )
}
