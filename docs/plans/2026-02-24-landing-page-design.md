# FYSH Landing Page Design Document

**Date:** 2026-02-24
**Project:** FYSH Sports Betting Research Platform
**Component:** Marketing Landing Page (Part 6)
**Status:** Approved Design

---

## Overview

Build a production-ready marketing landing page for FYSH that converts visitors into signups. The page must be visually stunning, fast (Lighthouse > 90), and communicate FYSH's value proposition with sharp, professional messaging.

**Brand Positioning:** Bloomberg Terminal for sports betting — data-driven, analytical, no-nonsense.

**Target Audience:** Serious bettors who want advanced tools and transparent analytics.

---

## Design Decisions

### 1. Hero Animation Style
**Chosen:** Subtle Elegance
- Gentle floating particles with slow gradient shifts
- Minimal CPU usage, premium feel
- CSS-based animations (no canvas overhead)
- Inspired by Apple product pages

### 2. Brand Voice & Tone
**Chosen:** Sharp & Professional
- Confident, analytical, data-focused copy
- No playful fishing puns in descriptions
- Feature names can have personality ("Catch of the Day")
- Professional tone throughout

### 3. Fishing Metaphor Balance
**Chosen:** Subtle Branding
- FYSH name stays, "Catch of the Day" stays as feature name
- One fishing reference in hero (light touch)
- All feature descriptions stay analytical and professional
- Balance brand personality with credibility

### 4. Feature Showcase Visuals
**Chosen:** Design Mockups
- High-fidelity mockup components built with existing UI primitives
- Production-ready appearance
- Reusable when building real features
- Better than placeholders or static images

### 5. Waitlist Backend
**Chosen:** Prisma Schema Integration
- Add `Waitlist` model to existing Prisma database
- Keep all data in one place
- Easier to query and manage pre-launch users

---

## Architecture

### File Structure

```
app/(marketing)/
├── page.tsx                    # Main orchestrator - composes all sections
├── sections/                   # Each landing page section
│   ├── hero-section.tsx
│   ├── social-proof-bar.tsx
│   ├── feature-showcase.tsx
│   ├── how-it-works.tsx
│   ├── comparison-section.tsx
│   ├── pricing-section.tsx
│   ├── waitlist-section.tsx
│   ├── faq-section.tsx
│   └── footer-cta.tsx
├── mockups/                    # High-fidelity feature mockups
│   ├── catch-of-day-mockup.tsx
│   ├── prop-finder-mockup.tsx
│   ├── ai-analysis-mockup.tsx
│   └── leaderboard-mockup.tsx
└── lib/
    └── animations.ts           # Shared framer-motion variants

app/api/
└── waitlist/
    └── route.ts                # POST endpoint for email capture

prisma/
└── schema.prisma              # Add Waitlist model
```

### Page Composition Pattern

The main `page.tsx` is a simple orchestrator that composes sections:

```tsx
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <SocialProofBar />
      <FeatureShowcase />
      <HowItWorks />
      <ComparisonSection />
      <PricingSection />
      <WaitlistSection />
      <FAQSection />
      <FooterCTA />
    </>
  )
}
```

### Rendering Strategy

- **Marketing layout:** Server-rendered by default
- **Sections use `'use client'` only when needed:**
  - Framer Motion animations
  - Form state (waitlist)
  - Interactive elements (FAQ accordion, pricing toggle)
- **Static sections** (How It Works, Comparison) stay server components for performance

---

## Component Breakdown

### 1. HeroSection
- **Layout:** Centered content, full viewport height (min-h-screen)
- **Background:** Dark gradient (ocean-deep → ocean-dark) + CSS particle animation
- **Content:**
  - FYSH logo (large, centered or top-left)
  - Headline: "AI-Powered Sports Betting Research"
  - Subheadline: "Advanced prop analytics, AI insights, and transparent track records. Built for serious bettors."
  - Primary CTA: "Start Free — No Card Required"
  - Secondary CTA: "See How It Works" (smooth scroll)
- **Animation:** Text fades in from bottom with stagger effect
- **Client component:** Yes (animations)

### 2. SocialProofBar
- **Layout:** Horizontal flex strip, subtle background
- **Content:** "2,500+ bettors" | "85% avg hit rate" | "4.8★ rated"
- **Animation:** Count-up effect when scrolled into view
- **Client component:** Yes (count-up)

### 3. FeatureShowcase
- **Layout:** Alternating image/text (left-right-left-right)
- **4 Features:**
  1. Catch of the Day (mockup + analytical copy)
  2. Prop Finder (mockup + analytical copy)
  3. AI Analysis (mockup + analytical copy)
  4. Community & Leaderboard (mockup + analytical copy)
- **Animation:** Fade + slide from direction
- **Client component:** Yes (scroll animations)

### 4. HowItWorks
- **Layout:** 3-step timeline (horizontal desktop, vertical mobile)
- **Visual:** Numbered circles connected by dotted line
- **Animation:** Sequential fade-in on scroll
- **Client component:** Yes (scroll animations)

### 5. ComparisonSection
- **Layout:** Two-column grid
- **Left (Others):** Muted gray text
- **Right (FYSH):** Neon teal highlights with glow
- **Animation:** Rows fade in on scroll
- **Client component:** Yes (scroll animations)

### 6. PricingSection
- **Layout:** 2 cards (Free vs Pro)
- **Interactive:** Monthly/Annual toggle
- **Pro card:** Elevated with neon-teal border, "MOST POPULAR" badge
- **Animation:** Cards scale on hover
- **Client component:** Yes (toggle state)

### 7. WaitlistSection
- **Layout:** Centered form
- **Form:** Email input + "Join Waitlist" button
- **Features:**
  - Real-time Zod validation
  - Loading state
  - Success message with position
  - Error handling (duplicates, invalid email)
- **Counter:** "X bettors on the waitlist"
- **Client component:** Yes (form state)

### 8. FAQSection
- **Layout:** Accordion expandable items
- **5 Questions** from spec
- **Animation:** Smooth expand/collapse (AnimatePresence)
- **Client component:** Yes (accordion state)

### 9. FooterCTA
- **Layout:** Full-width gradient section
- **Content:** Final CTA before footer
- **Server component:** Yes (static)

---

## Animation System

### Shared Animation Library (`lib/animations.ts`)

Reusable framer-motion variants for consistency:

```typescript
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
}

export const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 }
}

export const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 }
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
```

### Animation Patterns

1. **Hero:** Staggered fade-in on page load (immediate, no scroll trigger)
2. **Other sections:** Trigger when 20% enters viewport (`useInView`)
3. **Pricing cards:** CSS `:hover` transforms
4. **FAQ accordions:** `AnimatePresence` for height transitions
5. **Background particles:** Pure CSS `@keyframes`

### Performance Strategy

- Animations use `transform` and `opacity` only (GPU-accelerated)
- `will-change` applied sparingly
- `prefers-reduced-motion` support (disables all animations)
- Lazy load framer-motion for below-fold sections

### Hero Background Effect

CSS-based floating particles (30-40 divs):
```css
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
  50% { transform: translate(20px, -20px) scale(1.1); opacity: 0.6; }
}
```

Lightweight, no canvas, runs on compositor thread.

---

## Waitlist Backend

### Database Schema (`prisma/schema.prisma`)

```prisma
model Waitlist {
  id           String   @id @default(uuid())
  email        String   @unique
  referralCode String   @unique @map("referral_code")
  referredBy   String?  @map("referred_by")
  position     Int      // Auto-incrementing position
  joinedAt     DateTime @default(now()) @map("joined_at")

  @@map("waitlist")
  @@index([email])
}
```

### API Endpoint (`app/api/waitlist/route.ts`)

```
POST /api/waitlist
Request:  { email: string, referredBy?: string }
Response: { success: true, position: number, referralCode: string }
       | { error: string }
```

### Logic Flow

1. Validate email with Zod
2. Check for duplicate email
   - If exists: return 409 "Already on waitlist"
3. Generate unique 6-char referral code
4. Count existing entries for position number
5. Insert into database
6. Return success with position and referral code

### Error Handling

- Invalid email → 400 "Invalid email"
- Duplicate → 409 "Email already registered"
- Database error → 500 "Failed to join waitlist"
- Rate limiting: 5 requests/IP/hour (optional future addition)

### Frontend Integration

- Client-side validation first (instant feedback)
- Loading spinner on submit
- Success: "You're #X on the waitlist!" + referral link
- Error: message below input
- Referral format: `fysh.bet/ref/ABC123`

---

## Performance Optimizations

### Target Metrics
- Lighthouse Performance: > 90
- FCP: < 1.5s
- LCP: < 2.5s
- CLS: < 0.1

### Optimization Strategy

**Image Optimization:**
- `next/image` for all mockups
- Proper width/height (prevent layout shift)
- `loading="lazy"` below fold
- WebP format with fallbacks
- Blur placeholders

**Code Splitting:**
- Lazy load framer-motion: `dynamic(() => import('framer-motion'))`
- Below-fold sections load on-demand
- Zod validation loads only when needed

**Font Loading:**
- Preload critical fonts
- `font-display: swap` (prevent FOIT)
- Subset fonts

**JavaScript Bundle:**
- Minimal JS in hero (CSS particles only)
- Client components only where necessary
- Tree-shake unused framer-motion

**CSS Optimization:**
- Critical CSS inlined above-fold
- Tailwind purges unused classes
- GPU-accelerated animations only

**Rendering:**
- Static generation (ISR, 1-hour revalidation)
- Waitlist counter cached 5 minutes
- Serve from CDN

**Prefetching:**
- Prefetch `/auth/signup` on CTA hover
- DNS prefetch API domains

**Accessibility:**
- Semantic HTML
- Proper heading hierarchy
- Skip links for keyboard nav
- ARIA labels on interactive elements

---

## Mockup Components Strategy

### 1. Catch of the Day Mockup
- **Component:** Card with neon-teal glow
- **Content:**
  - "CATCH OF THE DAY" badge
  - Player name + team
  - Prop: "Points Over 24.5"
  - Odds: -110
  - Hit rate: "78% L10 games"
  - Mini AI snippet
  - "View Full Analysis" button
- **Styling:** Dark card, clean grid layout, subtle glow

### 2. Prop Finder Mockup
- **Component:** Table with filters
- **Content:**
  - Filter chips (sport, prop type, sportsbook)
  - Data grid: Player | Prop | Line | Odds | Hit Rate
  - Hover states on rows
  - Sort indicators
- **Styling:** Professional data table, alternating rows

### 3. AI Analysis Mockup
- **Component:** Structured card sections
- **Content:**
  - "AI Analysis" header with icon
  - Key insight callout
  - Bullet points (matchup, trends, value)
  - "High Confidence" indicator
  - Mini progress bars/charts
- **Styling:** Organized, scannable, uses Badge/Card

### 4. Leaderboard Mockup
- **Component:** Ranked list with avatars
- **Content:**
  - Top 5 users with rank badges (#1, #2, #3)
  - Avatar + username
  - Stats: Win rate, ROI, streak
- **Styling:** #1 gold accent, uses Avatar component

### Design Principles
- Real-looking data (not Lorem ipsum)
- Sensible stats (78% hit rate, not 234%)
- Consistent color system
- Responsive (simplify on mobile)
- ~200-300 lines TSX each, reuse UI components

---

## Success Criteria

- [ ] Landing page loads < 2s on mobile
- [ ] All sections render correctly (375px, 768px, 1440px)
- [ ] Hero is visually striking and communicates value prop immediately
- [ ] Waitlist form captures emails and stores in Prisma database
- [ ] All animations smooth (60fps), don't block main thread
- [ ] Lighthouse performance > 90
- [ ] Professional, data-focused brand voice throughout
- [ ] High-fidelity mockups look production-ready
- [ ] `prefers-reduced-motion` support works
- [ ] Accessible (semantic HTML, ARIA labels, keyboard nav)

---

## Next Steps

1. Create implementation plan (use writing-plans skill)
2. Build section components one by one
3. Create mockup components
4. Implement waitlist API + Prisma migration
5. Add animations and polish
6. Performance audit and optimization
7. Accessibility testing
8. Mobile responsiveness testing

---

**End of Design Document**
