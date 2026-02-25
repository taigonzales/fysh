# Code Comparison: Before vs After

## animations.ts

### Before (Buggy - Static Evaluation)
```typescript
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const fadeInUp: Variants = prefersReducedMotion() // ❌ Called at module load
  ? { /* reduced */ }
  : { /* normal */ }
```

### After (Fixed - Factory Function)
```typescript
export const createFadeInUp = (shouldReduceMotion: boolean): Variants =>
  shouldReduceMotion // ✅ Evaluated at component render time
    ? { /* reduced */ }
    : { /* normal */ }
```

---

## hero-section.tsx

### Before (Buggy)
```typescript
import { fadeInUp, staggerContainer } from '../lib/animations'

export function HeroSection() {
  // fadeInUp is static, never updates
  return (
    <motion.div variants={fadeInUp}>
      {/* content */}
    </motion.div>
  )
}
```

### After (Fixed)
```typescript
import { useReducedMotion } from 'framer-motion'
import { createFadeInUp, staggerContainer } from '../lib/animations'

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion() // ✅ Hook checks preference
  const fadeInUp = createFadeInUp(shouldReduceMotion) // ✅ Created at render
  
  return (
    <motion.div variants={fadeInUp}>
      {/* content */}
    </motion.div>
  )
}
```

---

## feature-showcase.tsx

### Before (Buggy)
```typescript
import { fadeInLeft, fadeInRight } from '../lib/animations'

function FeatureRow({ feature, index }) {
  // fadeInLeft and fadeInRight are static
  return (
    <>
      <motion.div variants={fadeInLeft} />
      <motion.div variants={fadeInRight} />
    </>
  )
}
```

### After (Fixed)
```typescript
import { useReducedMotion } from 'framer-motion'
import { createFadeInLeft, createFadeInRight } from '../lib/animations'

function FeatureRow({ feature, index }) {
  const shouldReduceMotion = useReducedMotion() // ✅ Hook checks preference
  const fadeInLeft = createFadeInLeft(shouldReduceMotion) // ✅ Created at render
  const fadeInRight = createFadeInRight(shouldReduceMotion) // ✅ Created at render
  
  return (
    <>
      <motion.div variants={fadeInLeft} />
      <motion.div variants={fadeInRight} />
    </>
  )
}
```

---

## Key Differences

| Aspect | Before (Buggy) | After (Fixed) |
|--------|---------------|---------------|
| **When evaluated** | Module load time | Component render time |
| **Updates** | Never | On preference change |
| **SSR-safe** | No (hydration mismatch) | Yes (uses Framer hook) |
| **User can change** | No (must reload) | Yes (reactive) |
| **Pattern** | Direct export | Factory function |
| **React integration** | None | Uses hooks properly |

---

## Why Factory Functions?

Factory functions allow us to:
1. **Defer evaluation** until the component renders
2. **Accept runtime parameters** (shouldReduceMotion from the hook)
3. **Re-create variants** when preference changes
4. **Maintain proper React lifecycle** integration

The pattern is:
```typescript
// Define factory
export const createAnimation = (preference: boolean) => variants

// Use in component
const preference = useReducedMotion() // Hook
const animation = createAnimation(preference) // Factory call
```

This ensures animations are always in sync with the current user preference.
