'use client'

/**
 * How It Works
 * 3-step timeline showing user journey
 */

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { UserPlus, Search, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Sign Up in Seconds',
    description:
      'Create your free account—no credit card needed. Access our dashboard and start exploring picks immediately.',
  },
  {
    number: 2,
    icon: Search,
    title: 'Discover Value Picks',
    description:
      'Browse AI-curated picks, filter props across sportsbooks, or run your own analysis. Our tools surface opportunities you&apos;d never find manually.',
  },
  {
    number: 3,
    icon: TrendingUp,
    title: 'Track Your Edge',
    description:
      'Log your bets, monitor performance, and see how you stack up. Transparent stats and CLV tracking keep you accountable and improving.',
  },
]

export function HowItWorks() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" className="py-24 bg-ocean-deep" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            How It Works
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Start finding value in minutes, not hours
          </p>
        </motion.div>

        {/* Timeline - Horizontal on Desktop, Vertical on Mobile */}
        <div className="relative">
          {/* Desktop: Horizontal Line */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-border" />

          {/* Mobile: Vertical Line */}
          <div className="md:hidden absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Step Number Circle */}
                  <div className="flex md:justify-center mb-6">
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-ocean-card border-4 border-neon-teal shadow-neon-glow-sm">
                      <Icon className="w-7 h-7 text-neon-teal" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="md:text-center ml-24 md:ml-0 -mt-16 md:mt-0 pt-20 md:pt-0">
                    <div className="inline-block px-3 py-1 bg-neon-teal/10 rounded-full text-sm text-neon-teal font-semibold mb-3">
                      Step {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-3">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector Dot on Desktop */}
                  <div className="hidden md:block absolute top-16 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neon-teal" />

                  {/* Connector Dot on Mobile */}
                  <div className="md:hidden absolute left-8 top-8 -translate-x-1/2 w-3 h-3 rounded-full bg-neon-teal" />
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-text-muted">
            Join 2,500+ bettors already gaining an edge
          </p>
        </motion.div>
      </div>
    </section>
  )
}
