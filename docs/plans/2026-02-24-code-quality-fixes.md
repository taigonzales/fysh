# Code Quality & Accessibility Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate all build warnings and add WCAG-compliant reduced motion support

**Architecture:** Fix React hooks pattern, upgrade to Next.js Image component, add motion preference detection in both JS and CSS layers

**Tech Stack:** React hooks (useCallback), Next.js Image, Framer Motion, CSS media queries

---

## Task 1: Fix useEffect Dependency Warning (Games Page)

**Files:**
- Modify: `app/games/page.tsx:1-45`

**Step 1: Add useCallback import**

In `app/games/page.tsx`, update the React import:

```typescript
import { useEffect, useState, useCallback } from 'react'
```

**Step 2: Wrap fetchGames in useCallback**

Replace the `fetchGames` function (lines 45-57) with:

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
```

**Step 3: Update useEffect dependency array**

Replace the useEffect (lines 41-43) with:

```typescript
useEffect(() => {
  fetchGames()
}, [fetchGames])
```

**Step 4: Verify the fix**

Run: `pnpm build`
Expected: No warning about "React Hook useEffect has a missing dependency: 'fetchGames'"

**Step 5: Test functionality**

Run dev server and verify:
- `pnpm dev`
- Navigate to `/games`
- Click different sport filters (NBA, NHL, etc.)
- Games should load correctly for each sport

Expected: Games load and filter works without console warnings

**Step 6: Commit**

```bash
git add app/games/page.tsx
git commit -m "fix: wrap fetchGames in useCallback to fix useEffect dependency warning

- Add useCallback import from React
- Wrap fetchGames with useCallback and selectedSport dependency
- Update useEffect to include fetchGames in dependency array
- Eliminates React Hook dependency warning

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Fix Avatar Image Optimization Warning

**Files:**
- Modify: `components/ui/avatar.tsx:1-50`

**Step 1: Add Next.js Image import**

In `components/ui/avatar.tsx`, add Image import at the top:

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { User } from 'lucide-react'
```

**Step 2: Update parent div to support fill layout**

Replace the outer div (lines 25-35) to add `position: relative`:

```typescript
<div
  className={cn(
    'relative rounded-full bg-ocean-dark border border-border flex items-center justify-center overflow-hidden',
    {
      'h-8 w-8 text-xs': size === 'sm',
      'h-10 w-10 text-sm': size === 'md',
      'h-12 w-12 text-base': size === 'lg',
      'h-16 w-16 text-lg': size === 'xl',
    },
    className
  )}
>
```

**Step 3: Replace img with Image component**

Replace the `<img>` tag (lines 38-43) with:

```typescript
{src && !imageError ? (
  <Image
    src={src}
    alt={name || 'Avatar'}
    fill
    className="object-cover"
    onError={() => setImageError(true)}
    unoptimized={src.startsWith('http')}
  />
) : initials ? (
  <span className="font-semibold text-neon-teal">{initials}</span>
) : (
  <User className="h-1/2 w-1/2 text-text-muted" />
)}
```

**Step 4: Verify the fix**

Run: `pnpm build`
Expected: No warning about "Using `<img>` could result in slower LCP"

**Step 5: Test Avatar rendering**

Create test file to verify all avatar states work:

Run: `pnpm dev`
Navigate to any page with avatars (leaderboard mockup at `/`)

Verify:
- Avatars with images render correctly
- Fallback to initials works
- Fallback to User icon works
- No console errors

Expected: All avatar states render correctly

**Step 6: Commit**

```bash
git add components/ui/avatar.tsx
git commit -m "fix: replace img with Next.js Image component in Avatar

- Import Next.js Image component
- Add relative positioning to parent div for fill layout
- Replace img tag with Image using fill prop
- Add unoptimized prop for external URLs
- Eliminates image optimization warning

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Add Reduced Motion Support (Framer Motion)

**Files:**
- Modify: `app/(marketing)/lib/animations.ts:1-49`

**Step 1: Add motion preference detection utility**

At the top of `animations.ts`, add utility function:

```typescript
// Shared framer-motion animation variants for landing page
import { Variants } from 'framer-motion'

// Utility to detect if user prefers reduced motion
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

**Step 2: Update fadeInUp animation**

Replace the `fadeInUp` export (lines 4-11) with motion-aware version:

```typescript
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
```

**Step 3: Update fadeInLeft animation**

Replace the `fadeInLeft` export (lines 13-20) with motion-aware version:

```typescript
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
```

**Step 4: Update fadeInRight animation**

Replace the `fadeInRight` export (lines 22-29) with motion-aware version:

```typescript
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
```

**Step 5: Update scaleOnHover animation**

Replace the `scaleOnHover` export (lines 42-48) with motion-aware version:

```typescript
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
```

**Step 6: Keep staggerContainer unchanged**

The `staggerContainer` doesn't need motion reduction (it just controls timing):

```typescript
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
```

**Step 7: Test reduced motion**

Manual test in browser:
1. Enable "Reduce motion" in OS settings:
   - **macOS:** System Settings → Accessibility → Display → Reduce motion
   - **Windows:** Settings → Accessibility → Visual effects → Animation effects (turn OFF)
2. Run `pnpm dev`
3. Navigate to landing page (`/`)
4. Verify animations are instant/subtle (no sliding, only fade)

Expected: Content appears with minimal motion

**Step 8: Test normal motion**

Disable "Reduce motion" and refresh landing page
Expected: Full animations with sliding/scaling effects

**Step 9: Commit**

```bash
git add app/(marketing)/lib/animations.ts
git commit -m "feat: add reduced motion support to Framer Motion animations

- Add prefersReducedMotion utility function
- Update fadeInUp/Left/Right to respect motion preference
- Update scaleOnHover to use opacity instead of scale when reduced
- Reduced motion shows instant fades instead of slides
- WCAG 2.1 Level A compliant (2.3.3 Animation from Interactions)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Add CSS Reduced Motion Support

**Files:**
- Modify: `app/globals.css:1-37`

**Step 1: Add prefers-reduced-motion media query**

At the end of `globals.css` (after the scrollbar styles), add:

```css
@layer base {
  :root {
    --font-inter: 'Inter', sans-serif;
    --font-jetbrains-mono: 'JetBrains Mono', monospace;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-ocean-deep text-text-primary font-sans antialiased;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-ocean-dark;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-border rounded-lg;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-neon-teal/30;
  }

  /* Reduced motion support for accessibility */
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
}
```

**Step 2: Verify CSS is applied**

Run dev server:
```bash
pnpm dev
```

**Step 3: Test with browser DevTools**

1. Open DevTools (F12)
2. Open Command Palette (Cmd/Ctrl + Shift + P)
3. Type "Emulate CSS prefers-reduced-motion"
4. Select "reduce"
5. Verify all Tailwind animations are instant
6. Check loading spinner, hover effects, transitions

Expected: All CSS animations/transitions become instant

**Step 4: Test Tailwind animate utilities**

Navigate to `/games` page:
- Loading spinner should appear/disappear instantly (no spin)
- Button hover states should be instant
- Sport filter transitions should be instant

Expected: No animated motion, only instant state changes

**Step 5: Run production build**

```bash
pnpm build
```

Expected:
- Build succeeds
- **0 warnings**
- All pages generated successfully

**Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat: add CSS-level reduced motion support

- Add prefers-reduced-motion media query to globals.css
- Reduce all animations/transitions to 0.01ms when user prefers reduced motion
- Covers Tailwind utilities and custom CSS animations
- Completes WCAG 2.1 Level A compliance for motion

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Verification & Documentation

**Files:**
- Modify: `PROGRESS.md` (update status)

**Step 1: Run final production build**

```bash
pnpm build
```

Expected output:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (23/23)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    ...      ...
...
```

Verify: **0 warnings** (previously had 2)

**Step 2: Run Lighthouse accessibility audit**

1. Run production build: `pnpm build && pnpm start`
2. Open Chrome DevTools → Lighthouse tab
3. Select "Accessibility" only
4. Run audit on landing page (`/`)

Expected: **Accessibility score: 100/100**

**Step 3: Manual accessibility test checklist**

Test with reduced motion enabled:
- [ ] Landing page sections fade in without sliding
- [ ] Hero particles animation is minimal
- [ ] Hover effects are instant opacity changes
- [ ] FAQ accordion opens instantly
- [ ] Loading spinners appear instantly
- [ ] No jarring motion or sliding effects

Expected: All items pass

**Step 4: Functional regression test**

Test that nothing broke:
- [ ] Landing page loads and scrolls smoothly
- [ ] Waitlist form submits successfully
- [ ] Games page loads and filters work
- [ ] Odds panel expands/collapses correctly
- [ ] All buttons and links work
- [ ] No console errors

Expected: All functionality works as before

**Step 5: Update PROGRESS.md**

Replace the "Known Non-Blocking Warnings" section with:

```markdown
## ✅ All Warnings Resolved

Previous warnings fixed in this session:
1. ✅ **useEffect Dependency** (`/games` page) - Fixed with useCallback
2. ✅ **Image Optimization** (Avatar component) - Replaced with Next.js Image
3. ✅ **Reduced Motion Support** - Added WCAG-compliant motion preferences

### Accessibility Improvements
- ✅ WCAG 2.1 Level A compliant (Success Criterion 2.3.3)
- ✅ Framer Motion respects `prefers-reduced-motion`
- ✅ CSS animations respect motion preferences
- ✅ Lighthouse Accessibility: 100/100

---

## 🎯 Production Build Status

**Build Result:** ✅ **PASSING WITH 0 WARNINGS**

```
✓ Compiled successfully
✓ Generating static pages (23/23)
✓ Finalizing page optimization
```

**Warnings:** None ✓
**Errors:** None ✓
**Type Safety:** Passing ✓
**Accessibility:** WCAG 2.1 Level A ✓
```

**Step 6: Final commit**

```bash
git add PROGRESS.md
git commit -m "docs: update progress with resolved warnings and accessibility improvements

- All build warnings eliminated (0 warnings)
- WCAG 2.1 Level A compliance achieved
- Lighthouse accessibility score: 100/100
- Production build fully passing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 7: Verify git log**

```bash
git log --oneline -6
```

Expected: 5 new commits for this feature
1. Fix useEffect dependency warning
2. Fix Avatar image optimization
3. Add Framer Motion reduced motion support
4. Add CSS reduced motion support
5. Update progress documentation

---

## Success Criteria Checklist

Verify all criteria are met:

- [ ] `pnpm build` shows **0 warnings**
- [ ] All React Hook warnings eliminated
- [ ] Image optimization warnings eliminated
- [ ] Reduced motion support in Framer Motion
- [ ] Reduced motion support in CSS
- [ ] Lighthouse Accessibility score: 100/100
- [ ] WCAG 2.1 Level A compliant
- [ ] No breaking changes to functionality
- [ ] All tests passing (manual verification)
- [ ] Progress documentation updated
- [ ] 5 atomic commits made

---

## Rollback Plan

If issues arise, rollback commits:

```bash
# Rollback all changes
git log --oneline  # Find commit hash before this work
git reset --hard <commit-hash>

# Or rollback specific commits
git revert <commit-hash>  # Revert individual commits
```

**Note:** Since all changes are backwards-compatible and non-breaking, rollback should not be necessary. Changes are purely additive (adding useCallback, upgrading img to Image, adding motion queries).

---

## Related Documentation

- Design Doc: `docs/plans/2026-02-24-code-quality-fixes-design.md`
- WCAG 2.3.3: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
- Next.js Image: https://nextjs.org/docs/app/api-reference/components/image
- React useCallback: https://react.dev/reference/react/useCallback
- CSS prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
