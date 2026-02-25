# Code Quality & Accessibility Fixes - Design Document

**Date:** 2026-02-24
**Status:** Approved
**Type:** Bug Fixes + Accessibility Enhancement

## Overview

This design addresses all remaining build warnings and adds missing accessibility features to make FYSH production-ready with zero warnings and WCAG compliance.

## Problems Identified

### 1. Build Warnings (2 issues)
- **useEffect dependency warning** in `/games` page - `fetchGames` not in dependency array
- **Image optimization warning** in Avatar component - using `<img>` instead of Next.js `Image`

### 2. Accessibility Gap
- **No reduced motion support** - Animations don't respect `prefers-reduced-motion` media query (WCAG 2.1 Level A requirement)

### 3. Performance
- CSS animations ignore user motion preferences

## Approach

**Selected: Approach A - Comprehensive Fix**

Fix all warnings + add accessibility improvements in one go.

### Trade-offs Considered

**Approach A: Comprehensive Fix (Selected)**
- ✅ Eliminates all build warnings
- ✅ Improves accessibility (WCAG compliance)
- ✅ Better UX for motion-sensitive users
- ⚠️ More files to modify (4 files)

**Approach B: Warning Fixes Only**
- ✅ Cleans up build output
- ❌ Misses accessibility improvements
- ❌ Fails WCAG motion guidelines

**Approach C: Accessibility First**
- ✅ Improves UX
- ❌ Build warnings remain
- ❌ Incomplete solution

## Design Details

### Fix 1: useEffect Dependency Warning

**File:** `app/games/page.tsx`

**Problem:**
```typescript
// fetchGames is used in useEffect but not in dependency array
useEffect(() => {
  fetchGames()
}, [selectedSport])
```

React warns because `fetchGames` could have stale closures to component state.

**Solution:**
Wrap `fetchGames` in `useCallback` with proper dependencies:

```typescript
const fetchGames = useCallback(async () => {
  setLoading(true)
  try {
    const res = await fetch(`/api/games?sport=${selectedSport}`)
    const data = await res.json()
    if (data.success) {
      setGames(data.data)
    }
  } catch (error) {
    console.error('Failed to fetch games:', error)
  }
  setLoading(false)
}, [selectedSport])

useEffect(() => {
  fetchGames()
}, [fetchGames])
```

**Why this approach:**
- Preserves current behavior
- Fixes warning correctly (not with eslint-disable hack)
- Prevents unnecessary re-renders
- `fetchGames` only recreated when `selectedSport` changes

### Fix 2: Avatar Image Optimization

**File:** `components/ui/avatar.tsx`

**Current:**
```typescript
<img
  src={src}
  alt={name || 'Avatar'}
  className="h-full w-full object-cover"
  onError={() => setImageError(true)}
/>
```

**Problem:**
- Using plain `<img>` tag
- No image optimization
- Next.js warns to use `Image` component

**Solution:**
Replace with Next.js `Image` component with `fill` layout:

```typescript
import Image from 'next/image'

// In render:
<Image
  src={src}
  alt={name || 'Avatar'}
  fill
  className="object-cover"
  onError={() => setImageError(true)}
  unoptimized={src.startsWith('http')} // For external URLs
/>
```

**Why this approach:**
- Eliminates build warning
- Enables automatic image optimization for local images
- Handles external URLs with `unoptimized` prop
- Maintains current fallback behavior
- Uses `fill` layout since parent has defined dimensions

**Note:** Avatar images are typically small user profile pictures, so optimization impact is minimal but warning is eliminated.

### Fix 3: Reduced Motion Support (Animations)

**File:** `app/(marketing)/lib/animations.ts`

**Current:**
Animations always run at full speed, ignoring user preferences.

**Solution:**
Create motion-safe variants that respect `prefers-reduced-motion`:

```typescript
import { Variants } from 'framer-motion'

// Utility to check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Motion-safe variant creator
const createMotionVariant = (
  fullMotion: Variants,
  reducedMotion: Variants
): Variants => {
  return prefersReducedMotion() ? reducedMotion : fullMotion
}

// Updated animations
export const fadeInUp: Variants = prefersReducedMotion()
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    }
  : {
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.6, 0.01, 0.05, 0.95] },
      },
    }

// Similar for fadeInLeft, fadeInRight, scaleOnHover
```

**Why this approach:**
- Respects user accessibility preferences
- WCAG 2.1 Level A compliant (Success Criterion 2.3.3)
- Reduced motion still shows content (opacity only)
- Full motion preserved for users who want it
- No breaking changes to component usage

### Fix 4: CSS Reduced Motion Support

**File:** `app/globals.css`

**Current:**
No CSS-level motion preference handling.

**Solution:**
Add global `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Why this approach:**
- Catches all CSS animations/transitions globally
- Works even if Framer Motion fails to load
- Reduces motion to near-instant (0.01ms for technical reasons)
- Doesn't disable animations completely (prevents jarring jumps)
- Industry standard pattern (used by GitHub, Twitter, etc.)

**Affected elements:**
- Tailwind `animate-*` utilities
- Custom CSS transitions
- Scroll behavior
- Third-party library animations

## Files Modified

1. `app/games/page.tsx` - Add `useCallback` import and wrap `fetchGames`
2. `components/ui/avatar.tsx` - Replace `<img>` with `Image` component
3. `app/(marketing)/lib/animations.ts` - Add reduced motion variants
4. `app/globals.css` - Add `prefers-reduced-motion` media query

## Testing Plan

### Build Warnings
- [ ] Run `pnpm build` - should show 0 warnings
- [ ] Verify TypeScript compilation passes

### Functionality
- [ ] Games page still fetches correctly when switching sports
- [ ] Avatar component displays images/initials/fallback
- [ ] Animations still work for users without motion preference

### Accessibility
- [ ] Enable "Reduce motion" in OS settings
- [ ] Verify animations are minimal/instant
- [ ] Check landing page sections fade in without movement
- [ ] Test with screen reader (animations shouldn't block content)

### Performance
- [ ] Lighthouse audit - Accessibility score should be 100
- [ ] No new console warnings
- [ ] Avatar images load efficiently

## Success Criteria

- ✅ Zero build warnings when running `pnpm build`
- ✅ All animations respect `prefers-reduced-motion` setting
- ✅ Lighthouse Accessibility score: 100/100
- ✅ WCAG 2.1 Level A compliant (motion criterion)
- ✅ No breaking changes to existing functionality
- ✅ Production build passes all checks

## Notes

### Why Not Skip Image Optimization?
Even though avatar impact is minimal, eliminating the warning keeps build output clean and prevents hiding future real issues in build noise.

### Why Both JS and CSS Reduced Motion?
- **Framer Motion (JS):** Handles complex animations in landing page
- **CSS Media Query:** Catches Tailwind utilities and any CSS-based animations
- **Defense in depth:** Both layers ensure comprehensive coverage

### Browser Support
- `prefers-reduced-motion` supported in all modern browsers (Chrome 74+, Firefox 63+, Safari 10.1+)
- Degrades gracefully (animations run normally in unsupported browsers)

## Future Enhancements

Not in scope for this fix, but could be added later:
- User preference toggle to override OS settings
- Animation intensity slider (subtle/normal/dramatic)
- Per-section animation controls
- Analytics to track how many users prefer reduced motion
