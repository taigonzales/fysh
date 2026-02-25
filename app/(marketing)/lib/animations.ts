// Shared framer-motion animation variants for landing page
import { Variants } from 'framer-motion'

// Utility to detect if user prefers reduced motion
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const fadeInUp: Variants = prefersReducedMotion()
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

export const fadeInLeft: Variants = prefersReducedMotion()
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

export const fadeInRight: Variants = prefersReducedMotion()
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

export const scaleOnHover = prefersReducedMotion()
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
