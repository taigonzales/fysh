'use client'

/**
 * Comparison Section
 * Two-column comparison: Others vs FYSH
 */

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { X, Check } from 'lucide-react'

const comparisons = [
  {
    feature: 'AI-Powered Pick Analysis',
    others: false,
    fysh: true,
  },
  {
    feature: 'Transparent Track Records',
    others: false,
    fysh: true,
  },
  {
    feature: 'Cross-Sportsbook Prop Finder',
    others: false,
    fysh: true,
  },
  {
    feature: 'CLV (Closing Line Value) Tracking',
    others: false,
    fysh: true,
  },
  {
    feature: 'Free Tier Available',
    others: false,
    fysh: true,
  },
  {
    feature: 'Real-Time Data Updates',
    others: 'Delayed',
    fysh: true,
  },
  {
    feature: 'Community Insights',
    others: 'Limited',
    fysh: true,
  },
  {
    feature: 'Performance Analytics Dashboard',
    others: false,
    fysh: true,
  },
]

export function ComparisonSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section className="py-24 bg-ocean-card" ref={sectionRef}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-text-primary mb-4 tracking-tight">
            Why Choose{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-positive">
              FYSH
            </span>
            ?
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-light">
            Most betting tools are built for casual bettors.{' '}
            <span className="font-semibold text-text-primary">FYSH is built for winners.</span>
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          className="bg-ocean-deep rounded-xl overflow-hidden border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header Row */}
          <div className="grid grid-cols-3 border-b border-border bg-ocean-deep/50">
            <div className="px-6 py-4"></div>
            <div className="px-6 py-4 text-center">
              <p className="text-text-muted font-medium">Other Tools</p>
            </div>
            <div className="px-6 py-4 text-center bg-neon-teal/5 border-l-2 border-neon-teal">
              <p className="text-neon-teal font-bold">FYSH</p>
            </div>
          </div>

          {/* Comparison Rows */}
          {comparisons.map((item, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-3 border-b border-border last:border-b-0 hover:bg-ocean-deep/30 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
            >
              {/* Feature Name */}
              <div className="px-6 py-5">
                <p className="text-text-primary font-medium">{item.feature}</p>
              </div>

              {/* Others Column */}
              <div className="px-6 py-5 flex items-center justify-center">
                {typeof item.others === 'string' ? (
                  <span className="text-text-muted text-sm">{item.others}</span>
                ) : item.others ? (
                  <Check className="w-5 h-5 text-text-muted" />
                ) : (
                  <X className="w-5 h-5 text-text-muted/50" />
                )}
              </div>

              {/* FYSH Column */}
              <div className="px-6 py-5 flex items-center justify-center bg-neon-teal/5 border-l-2 border-neon-teal/20">
                {typeof item.fysh === 'string' ? (
                  <span className="text-neon-teal font-semibold text-sm">{item.fysh}</span>
                ) : item.fysh ? (
                  <div className="p-1 bg-neon-teal/20 rounded-full">
                    <Check className="w-4 h-4 text-neon-teal" />
                  </div>
                ) : (
                  <X className="w-5 h-5 text-text-muted/30" />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Note */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-sm text-text-muted">
            All features included in Free tier • Upgrade for advanced analytics
          </p>
        </motion.div>
      </div>
    </section>
  )
}
