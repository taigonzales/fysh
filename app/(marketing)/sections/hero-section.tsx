'use client'

/**
 * Hero Section
 * Full viewport height hero with animated particles background
 */

import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { createFadeInUp, staggerContainer } from '../lib/animations'

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()
  const fadeInUp = createFadeInUp(shouldReduceMotion)
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-ocean-deep via-ocean-dark to-ocean-card">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 35 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-neon-teal/20"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ocean-card/50 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Logo/Brand */}
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-teal via-text-primary to-neon-teal mb-4 drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]">
            FYSH
          </h1>
        </motion.div>

        {/* Headline */}
        <motion.h2
          variants={fadeInUp}
          className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6 leading-tight"
        >
          AI-Powered{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-positive">
            Sports Betting
          </span>{' '}
          Research
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          variants={fadeInUp}
          className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed font-light"
        >
          Advanced prop analytics, AI insights, and transparent track records.
          <br className="hidden md:block" />
          Built for{' '}
          <span className="font-semibold text-neon-teal">serious bettors</span>{' '}
          who demand data-driven decisions.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-neon-teal hover:bg-neon-teal-muted text-ocean-deep font-semibold px-8 py-6 text-lg shadow-neon-glow hover:shadow-neon-glow-sm transition-all"
            onClick={() => scrollToSection('waitlist')}
          >
            Start Free — No Card Required
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="border-2 border-neon-teal/50 text-neon-teal hover:bg-neon-teal/10 px-8 py-6 text-lg"
            onClick={() => scrollToSection('how-it-works')}
          >
            <PlayCircle className="mr-2 w-5 h-5" />
            See How It Works
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          variants={fadeInUp}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-text-muted text-sm"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-neon-teal" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-neon-teal" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-neon-teal" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>Trusted by 2,500+ bettors</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-text-muted"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
