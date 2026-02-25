'use client'

/**
 * Social Proof Bar
 * Displays key stats with count-up animation on scroll
 */

import { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Users, TrendingUp, Star } from 'lucide-react'

function CountUp({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const nodeRef = useRef(null)
  const isInView = useInView(nodeRef, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = (timestamp - startTime) / (duration * 1000)

      if (progress < 1) {
        setCount(Math.floor(end * progress))
        requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(step)
  }, [isInView, end, duration])

  return (
    <span ref={nodeRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function SocialProofBar() {
  return (
    <section className="py-12 bg-ocean-deep/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Stat 1: Bettors */}
          <div className="flex items-center gap-4 justify-center">
            <div className="p-3 bg-neon-teal/10 rounded-lg">
              <Users className="w-6 h-6 text-neon-teal" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">
                <CountUp end={2500} suffix="+" />
              </p>
              <p className="text-sm text-text-secondary">Active Bettors</p>
            </div>
          </div>

          {/* Stat 2: Hit Rate */}
          <div className="flex items-center gap-4 justify-center">
            <div className="p-3 bg-positive/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-positive" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">
                <CountUp end={85} suffix="%" />
              </p>
              <p className="text-sm text-text-secondary">Avg Hit Rate</p>
            </div>
          </div>

          {/* Stat 3: Rating */}
          <div className="flex items-center gap-4 justify-center">
            <div className="p-3 bg-neon-teal/10 rounded-lg">
              <Star className="w-6 h-6 text-neon-teal fill-neon-teal" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary">
                <CountUp end={4.8} suffix="★" duration={1.5} />
              </p>
              <p className="text-sm text-text-secondary">User Rating</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
