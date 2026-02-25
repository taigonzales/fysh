'use client'

/**
 * Pricing Section
 * Free vs Pro tiers with monthly/annual toggle
 */

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles } from 'lucide-react'

const plans = {
  free: {
    name: 'Free',
    tagline: 'For getting started',
    features: [
      'Daily Catch of the Day picks',
      'Basic prop finder',
      'Community leaderboard',
      'Limited AI analysis (5/day)',
      'Public track record',
      'Email alerts',
    ],
  },
  pro: {
    name: 'Pro',
    tagline: 'For serious bettors',
    monthlyPrice: 29,
    annualPrice: 249, // ~$21/month
    features: [
      'Everything in Free',
      'Unlimited AI analysis',
      'Advanced prop filters',
      'CLV tracking',
      'Custom alerts & notifications',
      'Performance analytics dashboard',
      'Priority support',
      'API access (coming soon)',
    ],
  },
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  const proPrice = isAnnual ? plans.pro.annualPrice : plans.pro.monthlyPrice
  const proMonthlyCost = isAnnual ? (plans.pro.annualPrice / 12).toFixed(0) : plans.pro.monthlyPrice

  return (
    <section className="py-24 bg-ocean-deep" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-text-primary mb-4 tracking-tight">
            Simple,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-positive">
              Transparent
            </span>{' '}
            Pricing
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8 font-light">
            Start free, upgrade when you&apos;re ready to unlock the full edge
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-ocean-card border border-border rounded-lg">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                !isAnnual
                  ? 'bg-neon-teal text-ocean-deep'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                isAnnual
                  ? 'bg-neon-teal text-ocean-deep'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-positive/20 text-positive px-2 py-0.5 rounded">
                Save 30%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-ocean-card border-border p-8 h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {plans.free.name}
                </h3>
                <p className="text-text-secondary text-sm">{plans.free.tagline}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-text-primary">$0</span>
                  <span className="text-text-muted">/forever</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plans.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neon-teal flex-shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="secondary"
                className="w-full border-2 border-neon-teal/50 text-neon-teal hover:bg-neon-teal/10"
                size="lg"
              >
                Get Started Free
              </Button>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-ocean-card border-2 border-neon-teal shadow-neon-glow p-8 h-full flex flex-col relative">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-neon-teal text-ocean-deep font-semibold px-4 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  MOST POPULAR
                </Badge>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {plans.pro.name}
                </h3>
                <p className="text-text-secondary text-sm">{plans.pro.tagline}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-text-primary">
                    ${proMonthlyCost}
                  </span>
                  <span className="text-text-muted">/month</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-text-muted mt-2">
                    Billed ${proPrice} annually
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plans.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neon-teal flex-shrink-0 mt-0.5" />
                    <span className="text-text-primary font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-neon-teal hover:bg-neon-teal-muted text-ocean-deep font-semibold shadow-neon-glow"
                size="lg"
              >
                Start Free Trial
              </Button>

              <p className="text-xs text-text-muted text-center mt-3">
                14-day free trial • Cancel anytime
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Note */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-text-muted text-sm">
            All plans include access to community features • Enterprise pricing available
          </p>
        </motion.div>
      </div>
    </section>
  )
}
