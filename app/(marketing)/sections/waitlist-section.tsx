'use client'

/**
 * Waitlist Section
 * Email capture form with API integration
 */

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { z } from 'zod'

const emailSchema = z.string().email('Please enter a valid email address')

type FormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>({ status: 'idle' })
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    const validation = emailSchema.safeParse(email)
    if (!validation.success) {
      setFormState({
        status: 'error',
        message: validation.error.issues[0]?.message || 'Invalid email address',
      })
      return
    }

    setFormState({ status: 'loading' })

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setFormState({
          status: 'success',
          message: data.message || "You've been added to the waitlist!",
        })
        setEmail('')
      } else {
        setFormState({
          status: 'error',
          message: data.message || 'Something went wrong. Please try again.',
        })
      }
    } catch (error) {
      setFormState({
        status: 'error',
        message: 'Network error. Please check your connection.',
      })
    }
  }

  return (
    <section
      id="waitlist"
      className="py-24 bg-gradient-to-b from-ocean-card to-ocean-deep"
      ref={sectionRef}
    >
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center p-3 bg-neon-teal/10 rounded-full mb-6">
            <Mail className="w-8 h-8 text-neon-teal" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-text-primary mb-4 tracking-tight">
            Join the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-positive">
              Waitlist
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-light">
            Get early access when we launch. No spam, just updates on our progress and{' '}
            <span className="font-semibold text-text-primary">exclusive perks</span> for early supporters.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (formState.status === 'error') {
                    setFormState({ status: 'idle' })
                  }
                }}
                className="flex-1 bg-ocean-card border-border text-text-primary placeholder:text-text-muted h-14 px-6 text-lg"
                disabled={formState.status === 'loading' || formState.status === 'success'}
              />
              <Button
                type="submit"
                size="lg"
                className="bg-neon-teal hover:bg-neon-teal-muted text-ocean-deep font-semibold px-8 h-14 text-lg shadow-neon-glow"
                disabled={formState.status === 'loading' || formState.status === 'success'}
              >
                {formState.status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : formState.status === 'success' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Joined!
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </Button>
            </div>

            {/* Status Messages */}
            {formState.status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-positive/10 border border-positive/30 rounded-lg"
              >
                <CheckCircle2 className="w-5 h-5 text-positive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-positive font-semibold">Success!</p>
                  <p className="text-text-secondary text-sm">{formState.message}</p>
                </div>
              </motion.div>
            )}

            {formState.status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-negative/10 border border-negative/30 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-negative flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-negative font-semibold">Error</p>
                  <p className="text-text-secondary text-sm">{formState.message}</p>
                </div>
              </motion.div>
            )}
          </form>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-text-muted text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-neon-teal" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-neon-teal" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span>Unsubscribe anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-neon-teal" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span>Early access perks</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
