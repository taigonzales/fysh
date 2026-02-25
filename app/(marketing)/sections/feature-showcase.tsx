'use client'

/**
 * Feature Showcase
 * Alternating layout displaying 4 key features with mockups
 */

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeInLeft, fadeInRight } from '../lib/animations'
import { CatchOfDayMockup } from '../mockups/catch-of-day-mockup'
import { PropFinderMockup } from '../mockups/prop-finder-mockup'
import { AiAnalysisMockup } from '../mockups/ai-analysis-mockup'
import { LeaderboardMockup } from '../mockups/leaderboard-mockup'
import { Sparkles, Search, Brain, Trophy } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Catch of the Day',
    description:
      'AI-curated daily picks backed by advanced analytics. Each pick includes detailed breakdowns, hit rates, and value assessments so you know exactly why it&apos;s worth your attention.',
    mockup: CatchOfDayMockup,
    direction: 'left' as const,
  },
  {
    icon: Search,
    title: 'Prop Finder',
    description:
      'Filter and compare thousands of props across sportsbooks in real-time. Advanced search lets you identify value opportunities before the market moves.',
    mockup: PropFinderMockup,
    direction: 'right' as const,
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    description:
      'Instant prop breakdowns powered by machine learning. Get matchup analysis, recent trends, and expected value calculations in seconds—not hours of manual research.',
    mockup: AiAnalysisMockup,
    direction: 'left' as const,
  },
  {
    icon: Trophy,
    title: 'Community & Leaderboard',
    description:
      'Transparent track records for every bettor. Follow top performers, learn from their picks, and see verified stats. No fake records, no hidden losses.',
    mockup: LeaderboardMockup,
    direction: 'right' as const,
  },
]

function FeatureRow({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const isReverse = feature.direction === 'right'
  const MockupComponent = feature.mockup
  const Icon = feature.icon

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-12 items-center ${isReverse ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Text Content */}
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={isReverse ? fadeInRight : fadeInLeft}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={isReverse ? 'md:order-2' : 'md:order-1'}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-neon-teal/10 rounded-lg">
            <Icon className="w-6 h-6 text-neon-teal" />
          </div>
          <span className="text-sm text-text-muted font-medium">Feature {index + 1}</span>
        </div>

        <h3 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
          {feature.title}
        </h3>

        <p className="text-lg text-text-secondary leading-relaxed">{feature.description}</p>
      </motion.div>

      {/* Mockup */}
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={isReverse ? fadeInLeft : fadeInRight}
        transition={{ duration: 0.6, delay: 0.4 }}
        className={isReverse ? 'md:order-1' : 'md:order-2'}
      >
        <MockupComponent />
      </motion.div>
    </div>
  )
}

export function FeatureShowcase() {
  return (
    <section className="py-24 bg-ocean-card">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-text-primary mb-4 tracking-tight">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-positive to-neon-teal">
              Win
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-light">
            Professional-grade tools that give you an edge over the sportsbooks
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <FeatureRow key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
