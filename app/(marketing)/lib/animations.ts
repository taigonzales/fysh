// Shared framer-motion animation variants for landing page
import { Variants } from 'framer-motion'

// Factory function for fadeInUp animation with reduced motion support
export const createFadeInUp = (shouldReduceMotion: boolean | null): Variants =>
  shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.2 },
        },
      }
    : {
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.6, 0.01, 0.05, 0.95] },
        },
      }

// Factory function for fadeInLeft animation with reduced motion support
export const createFadeInLeft = (shouldReduceMotion: boolean | null): Variants =>
  shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.2 },
        },
      }
    : {
        hidden: { opacity: 0, x: -40 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: [0.6, 0.01, 0.05, 0.95] },
        },
      }

// Factory function for fadeInRight animation with reduced motion support
export const createFadeInRight = (shouldReduceMotion: boolean | null): Variants =>
  shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.2 },
        },
      }
    : {
        hidden: { opacity: 0, x: 40 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: [0.6, 0.01, 0.05, 0.95] },
        },
      }

// Factory function for scaleOnHover with reduced motion support
export const createScaleOnHover = (shouldReduceMotion: boolean | null) =>
  shouldReduceMotion
    ? {
        rest: { opacity: 1 },
        hover: { opacity: 0.9, transition: { duration: 0.1 } },
      }
    : {
        rest: { scale: 1 },
        hover: {
          scale: 1.02,
          transition: { duration: 0.3 },
        },
      }

// staggerContainer doesn't need motion detection
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}
