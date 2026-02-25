'use client'

/**
 * FAQ Section
 * Accordion with 5 common questions
 */

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Is FYSH really free?',
    answer:
      'Yes! Our Free tier gives you access to daily AI picks, basic prop finder, community leaderboard, and limited AI analysis (5 per day). You can use FYSH free forever. Pro tier unlocks unlimited analysis, advanced features, and CLV tracking for serious bettors.',
  },
  {
    question: 'How accurate are your AI picks?',
    answer:
      "Our AI models analyze 10+ data sources including historical performance, matchup data, injury reports, and line movements. Top community picks maintain 65-70% hit rates. We display transparent track records for all picks—no cherry-picking, no hiding losses. Remember, no system is perfect, and past performance doesn't guarantee future results.",
  },
  {
    question: 'Do you provide picks for all sports?',
    answer:
      'We currently support NBA, NFL, MLB, NHL, NCAAB, and NCAAF. Our AI analysis works best for major markets with high liquidity. We&apos;re constantly expanding coverage based on user demand and data availability.',
  },
  {
    question: 'What is CLV tracking and why does it matter?',
    answer:
      "Closing Line Value (CLV) measures how your bet odds compare to the closing line when the game starts. Consistently beating the closing line is the #1 indicator of long-term profitability. Our CLV tracker automatically calculates this for every bet you log, helping you measure your edge objectively.",
  },
  {
    question: 'Can I cancel my Pro subscription anytime?',
    answer:
      'Absolutely. No long-term contracts, no cancellation fees. You can downgrade to Free tier anytime from your account settings. If you cancel mid-month, you&apos;ll retain Pro access until your billing period ends.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24 bg-ocean-card" ref={sectionRef}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center p-3 bg-neon-teal/10 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-neon-teal" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-text-secondary">
            Everything you need to know about FYSH
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <motion.div
                key={index}
                className="bg-ocean-deep border border-border rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-ocean-deep/50 transition-colors group"
                >
                  <span className="font-semibold text-text-primary text-lg pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-neon-teal" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-2">
                        <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Help */}
        <motion.div
          className="text-center mt-12 p-6 bg-ocean-deep/50 border border-border rounded-lg"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-text-secondary mb-3">Still have questions?</p>
          <p className="text-text-muted text-sm">
            Email us at{' '}
            <a
              href="mailto:support@fysh.bet"
              className="text-neon-teal hover:underline font-medium"
            >
              support@fysh.bet
            </a>{' '}
            or join our Discord community
          </p>
        </motion.div>
      </div>
    </section>
  )
}
