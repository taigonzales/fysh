/**
 * Footer CTA
 * Final conversion push before footer (Server Component)
 */

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function FooterCTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-ocean-deep via-ocean-card to-ocean-deep relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center p-4 bg-neon-teal/10 rounded-full mb-6">
          <Sparkles className="w-10 h-10 text-neon-teal" />
        </div>

        {/* Headline */}
        <h2 className="text-5xl md:text-6xl font-black text-text-primary mb-6 tracking-tight">
          Ready to Gain Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-positive">
            Edge
          </span>
          ?
        </h2>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-10 font-light">
          Join <span className="font-bold text-neon-teal">2,500+</span> bettors using data-driven insights to make smarter bets.
          <br className="hidden md:block" />
          Start free—upgrade only when you&apos;re winning.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-neon-teal hover:bg-neon-teal-muted text-ocean-deep font-semibold px-10 py-6 text-lg shadow-neon-glow hover:shadow-neon-glow-sm transition-all"
          >
            Start Free Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="border-2 border-neon-teal/50 text-neon-teal hover:bg-neon-teal/10 px-10 py-6 text-lg"
          >
            View Pricing
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-text-muted text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-positive" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-positive" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-positive" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
