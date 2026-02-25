# FYSH Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready marketing landing page with 9 sections, high-fidelity mockups, waitlist backend, and performance optimizations (Lighthouse > 90).

**Architecture:** Modular component-first architecture. Each section is self-contained with its own animations. Main page.tsx orchestrates sections. Waitlist backend uses Prisma. CSS particles for hero background (no canvas).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Prisma, Zod

---

## Task 1: Create Directory Structure and Animation Library

**Files:**
- Create: `app/(marketing)/sections/.gitkeep`
- Create: `app/(marketing)/mockups/.gitkeep`
- Create: `app/(marketing)/lib/animations.ts`

**Step 1: Create directories**

```bash
mkdir -p app/\(marketing\)/sections
mkdir -p app/\(marketing\)/mockups
mkdir -p app/\(marketing\)/lib
touch app/\(marketing\)/sections/.gitkeep
touch app/\(marketing\)/mockups/.gitkeep
```

**Step 2: Create shared animation library**

File: `app/(marketing)/lib/animations.ts`

```typescript
// Shared framer-motion animation variants for landing page
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
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

export const scaleOnHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.3 },
  },
}
```

**Step 3: Commit**

```bash
git add app/\(marketing\)/sections/.gitkeep app/\(marketing\)/mockups/.gitkeep app/\(marketing\)/lib/animations.ts
git commit -m "feat: add landing page directory structure and animation library

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add Waitlist Model to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma` (add at end of file)

**Step 1: Add Waitlist model to schema**

File: `prisma/schema.prisma` (append to end)

```prisma
// ============================================
// WAITLIST (Pre-launch email capture)
// ============================================

model Waitlist {
  id           String   @id @default(uuid())
  email        String   @unique
  referralCode String   @unique @map("referral_code")
  referredBy   String?  @map("referred_by")
  position     Int      // Auto-incrementing waitlist position
  joinedAt     DateTime @default(now()) @map("joined_at")

  @@map("waitlist")
  @@index([email])
}
```

**Step 2: Generate Prisma client**

```bash
npx prisma generate
```

Expected: "Generated Prisma Client"

**Step 3: Create migration**

```bash
npx prisma migrate dev --name add_waitlist_model
```

Expected: Migration created and applied

**Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Waitlist model for email capture

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Build Waitlist API Route

**Files:**
- Create: `app/api/waitlist/route.ts`

**Step 1: Create API route with validation**

File: `app/api/waitlist/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  referredBy: z.string().optional(),
})

// Generate unique 6-character referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = waitlistSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const { email, referredBy } = validation.data

    // Check for duplicate email
    const existing = await prisma.waitlist.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Generate unique referral code
    let referralCode = generateReferralCode()
    let isUnique = false

    while (!isUnique) {
      const codeExists = await prisma.waitlist.findUnique({
        where: { referralCode },
      })
      if (!codeExists) {
        isUnique = true
      } else {
        referralCode = generateReferralCode()
      }
    }

    // Get current position (count + 1)
    const count = await prisma.waitlist.count()
    const position = count + 1

    // Insert into database
    await prisma.waitlist.create({
      data: {
        email,
        referralCode,
        referredBy: referredBy || null,
        position,
      },
    })

    return NextResponse.json(
      { success: true, position, referralCode },
      { status: 201 }
    )
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch waitlist count
export async function GET() {
  try {
    const count = await prisma.waitlist.count()
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Waitlist count error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch count' },
      { status: 500 }
    )
  }
}
```

**Step 2: Test API manually**

```bash
npm run dev
```

Then test with curl:
```bash
curl -X POST http://localhost:3000/api/waitlist -H "Content-Type: application/json" -d '{"email":"test@example.com"}'
```

Expected: `{"success":true,"position":1,"referralCode":"ABC123"}`

**Step 3: Commit**

```bash
git add app/api/waitlist/route.ts
git commit -m "feat: add waitlist API route with email validation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Build Catch of the Day Mockup Component

**Files:**
- Create: `app/(marketing)/mockups/catch-of-day-mockup.tsx`

**Step 1: Create mockup component**

File: `app/(marketing)/mockups/catch-of-day-mockup.tsx`

```typescript
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp } from 'lucide-react'

export function CatchOfDayMockup() {
  return (
    <Card className="p-6 max-w-md mx-auto shadow-neon-glow">
      <Badge className="mb-4 bg-neon-teal text-ocean-deep font-bold">
        CATCH OF THE DAY
      </Badge>

      <div className="space-y-4">
        {/* Player Info */}
        <div>
          <h3 className="text-2xl font-bold text-text-primary">Jayson Tatum</h3>
          <p className="text-text-secondary">Boston Celtics vs Lakers</p>
        </div>

        {/* Prop Details */}
        <div className="bg-ocean-dark rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Points</span>
            <span className="text-xl font-bold text-text-primary">Over 28.5</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Odds</span>
            <span className="text-lg font-semibold text-neon-teal">-110</span>
          </div>
        </div>

        {/* Hit Rate */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-positive" />
          <span className="text-text-primary font-semibold">78% hit rate</span>
          <span className="text-text-secondary text-sm">L10 games</span>
        </div>

        {/* AI Insight Snippet */}
        <div className="bg-ocean-card border border-neon-teal/20 rounded-lg p-3">
          <p className="text-sm text-text-secondary">
            <span className="text-neon-teal font-semibold">AI Insight: </span>
            Tatum averages 31.2 PPG vs LAL defense this season. Lakers rank 28th in perimeter defense.
          </p>
        </div>

        {/* CTA */}
        <Button variant="primary" className="w-full">
          View Full Analysis
        </Button>
      </div>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/mockups/catch-of-day-mockup.tsx
git commit -m "feat: add Catch of the Day mockup component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Build Prop Finder Mockup Component

**Files:**
- Create: `app/(marketing)/mockups/prop-finder-mockup.tsx`

**Step 1: Create mockup component**

File: `app/(marketing)/mockups/prop-finder-mockup.tsx`

```typescript
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ArrowUpDown } from 'lucide-react'

export function PropFinderMockup() {
  const mockProps = [
    { player: 'LeBron James', team: 'LAL', prop: 'Points', line: '26.5', odds: '-115', hitRate: '64%' },
    { player: 'Stephen Curry', team: 'GSW', prop: '3PM', line: '4.5', odds: '-120', hitRate: '72%' },
    { player: 'Nikola Jokic', team: 'DEN', prop: 'Rebounds', line: '12.5', odds: '-110', hitRate: '81%' },
    { player: 'Giannis Antetokounmpo', team: 'MIL', prop: 'Points', line: '31.5', odds: '-105', hitRate: '69%' },
  ]

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Badge className="bg-ocean-card text-text-primary border border-border px-4 py-2 cursor-pointer hover:border-neon-teal transition-colors">
          NBA <ChevronDown className="ml-2 h-4 w-4 inline" />
        </Badge>
        <Badge className="bg-ocean-card text-text-primary border border-border px-4 py-2 cursor-pointer hover:border-neon-teal transition-colors">
          All Props <ChevronDown className="ml-2 h-4 w-4 inline" />
        </Badge>
        <Badge className="bg-ocean-card text-text-primary border border-border px-4 py-2 cursor-pointer hover:border-neon-teal transition-colors">
          All Books <ChevronDown className="ml-2 h-4 w-4 inline" />
        </Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 text-text-secondary font-semibold text-sm">
                Player <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </th>
              <th className="text-left py-3 text-text-secondary font-semibold text-sm">
                Prop
              </th>
              <th className="text-right py-3 text-text-secondary font-semibold text-sm">
                Line
              </th>
              <th className="text-right py-3 text-text-secondary font-semibold text-sm">
                Odds
              </th>
              <th className="text-right py-3 text-text-secondary font-semibold text-sm">
                Hit Rate <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </th>
            </tr>
          </thead>
          <tbody>
            {mockProps.map((prop, idx) => (
              <tr
                key={idx}
                className="border-b border-border/50 hover:bg-ocean-card transition-colors cursor-pointer"
              >
                <td className="py-4">
                  <div>
                    <span className="text-text-primary font-semibold">{prop.player}</span>
                    <span className="text-text-muted text-sm ml-2">{prop.team}</span>
                  </div>
                </td>
                <td className="py-4 text-text-secondary">{prop.prop}</td>
                <td className="py-4 text-right text-text-primary font-semibold">{prop.line}</td>
                <td className="py-4 text-right text-neon-teal font-semibold">{prop.odds}</td>
                <td className="py-4 text-right">
                  <Badge className="bg-positive/20 text-positive border-0">
                    {prop.hitRate}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/mockups/prop-finder-mockup.tsx
git commit -m "feat: add Prop Finder mockup component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Build AI Analysis Mockup Component

**Files:**
- Create: `app/(marketing)/mockups/ai-analysis-mockup.tsx`

**Step 1: Create mockup component**

File: `app/(marketing)/mockups/ai-analysis-mockup.tsx`

```typescript
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, TrendingUp, Target, BarChart3 } from 'lucide-react'

export function AiAnalysisMockup() {
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-neon-teal/20 p-3 rounded-lg">
          <Bot className="h-6 w-6 text-neon-teal" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-text-primary">AI Analysis</h3>
          <p className="text-text-secondary text-sm">Jayson Tatum Points Over 28.5</p>
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-neon-teal/10 border border-neon-teal/30 rounded-lg p-4 mb-6">
        <p className="text-text-primary font-semibold">
          Strong value play. Tatum's recent form and matchup history suggest 82% probability of clearing this line.
        </p>
      </div>

      {/* Analysis Points */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-positive mt-0.5" />
          <div>
            <p className="text-text-primary font-semibold">Recent Form</p>
            <p className="text-text-secondary text-sm">
              Averaging 31.2 PPG over last 5 games, cleared 28.5 in 4 of 5
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-neon-teal mt-0.5" />
          <div>
            <p className="text-text-primary font-semibold">Matchup Advantage</p>
            <p className="text-text-secondary text-sm">
              Lakers rank 28th in perimeter defense, allowing 27.4 PPG to SFs
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <BarChart3 className="h-5 w-5 text-coral mt-0.5" />
          <div>
            <p className="text-text-primary font-semibold">Historical Data</p>
            <p className="text-text-secondary text-sm">
              78% hit rate on O28.5 this season, 83% vs LAL specifically
            </p>
          </div>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-text-secondary">Confidence Level</span>
        <Badge className="bg-positive/20 text-positive border-0 px-4 py-1">
          High Confidence
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-ocean-card rounded-full h-2">
          <div className="bg-positive h-2 rounded-full" style={{ width: '82%' }}></div>
        </div>
        <p className="text-right text-xs text-text-muted mt-1">82% probability</p>
      </div>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/mockups/ai-analysis-mockup.tsx
git commit -m "feat: add AI Analysis mockup component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Build Leaderboard Mockup Component

**Files:**
- Create: `app/(marketing)/mockups/leaderboard-mockup.tsx`

**Step 1: Create mockup component**

File: `app/(marketing)/mockups/leaderboard-mockup.tsx`

```typescript
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp } from 'lucide-react'

export function LeaderboardMockup() {
  const mockUsers = [
    { rank: 1, username: 'SharpShoota', avatar: '🎯', winRate: '68.2%', roi: '+24.3%', streak: 8 },
    { rank: 2, username: 'PropKing', avatar: '👑', winRate: '65.7%', roi: '+19.8%', streak: 5 },
    { rank: 3, username: 'DataDriven', avatar: '📊', winRate: '64.1%', roi: '+17.2%', streak: 12 },
    { rank: 4, username: 'EdgeFinder', avatar: '🔍', winRate: '62.9%', roi: '+15.4%', streak: 3 },
    { rank: 5, username: 'StatsMaster', avatar: '📈', winRate: '61.5%', roi: '+13.9%', streak: 7 },
  ]

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-400'
    return 'text-text-muted'
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400/20 border-yellow-400/50'
    return ''
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-6 w-6 text-neon-teal" />
        <h3 className="text-xl font-bold text-text-primary">Top Bettors This Week</h3>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {mockUsers.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center gap-4 p-4 rounded-lg border border-border hover:border-neon-teal/50 transition-all cursor-pointer ${getRankBg(user.rank)}`}
          >
            {/* Rank */}
            <div className={`text-2xl font-bold ${getRankColor(user.rank)} w-8 text-center`}>
              {user.rank}
            </div>

            {/* Avatar */}
            <div className="text-3xl">{user.avatar}</div>

            {/* User Info */}
            <div className="flex-1">
              <p className="text-text-primary font-semibold">{user.username}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-text-secondary text-sm">
                  Win Rate: <span className="text-positive font-semibold">{user.winRate}</span>
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-text-secondary text-sm">
                  ROI: <span className="text-neon-teal font-semibold">{user.roi}</span>
                </span>
              </div>
            </div>

            {/* Streak */}
            <Badge className="bg-positive/20 text-positive border-0 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {user.streak}W
            </Badge>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border text-center">
        <p className="text-text-secondary text-sm">
          Rankings updated every Sunday. Post picks to compete.
        </p>
      </div>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/mockups/leaderboard-mockup.tsx
git commit -m "feat: add Leaderboard mockup component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Build Hero Section Component

**Files:**
- Create: `app/(marketing)/sections/hero-section.tsx`
- Create: `app/(marketing)/styles/particles.css`

**Step 1: Create particles CSS**

File: `app/(marketing)/styles/particles.css`

```css
/* Floating particles animation for hero background */
.particles-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(0, 240, 255, 0.3);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(var(--tx), var(--ty)) scale(1.1);
    opacity: 0.6;
  }
}

/* Generate particles with randomized animation */
.particle:nth-child(1) { left: 10%; top: 20%; --tx: 20px; --ty: -20px; animation-duration: 8s; animation-delay: 0s; }
.particle:nth-child(2) { left: 25%; top: 60%; --tx: -15px; --ty: 25px; animation-duration: 10s; animation-delay: 1s; }
.particle:nth-child(3) { left: 45%; top: 15%; --tx: 18px; --ty: -18px; animation-duration: 12s; animation-delay: 2s; }
.particle:nth-child(4) { left: 65%; top: 70%; --tx: -20px; --ty: 20px; animation-duration: 9s; animation-delay: 0.5s; }
.particle:nth-child(5) { left: 80%; top: 30%; --tx: 15px; --ty: -25px; animation-duration: 11s; animation-delay: 1.5s; }
.particle:nth-child(6) { left: 15%; top: 80%; --tx: 22px; --ty: -15px; animation-duration: 13s; animation-delay: 3s; }
.particle:nth-child(7) { left: 35%; top: 40%; --tx: -18px; --ty: 22px; animation-duration: 10s; animation-delay: 2.5s; }
.particle:nth-child(8) { left: 55%; top: 85%; --tx: 20px; --ty: -20px; animation-duration: 14s; animation-delay: 1s; }
.particle:nth-child(9) { left: 75%; top: 50%; --tx: -25px; --ty: 18px; animation-duration: 11s; animation-delay: 3.5s; }
.particle:nth-child(10) { left: 90%; top: 10%; --tx: 15px; --ty: -22px; animation-duration: 9s; animation-delay: 0.8s; }
.particle:nth-child(11) { left: 20%; top: 45%; --tx: -20px; --ty: 20px; animation-duration: 12s; animation-delay: 2s; }
.particle:nth-child(12) { left: 40%; top: 25%; --tx: 18px; --ty: -18px; animation-duration: 10s; animation-delay: 1.2s; }
.particle:nth-child(13) { left: 60%; top: 55%; --tx: -22px; --ty: 25px; animation-duration: 13s; animation-delay: 3.2s; }
.particle:nth-child(14) { left: 70%; top: 90%; --tx: 20px; --ty: -20px; animation-duration: 11s; animation-delay: 0.3s; }
.particle:nth-child(15) { left: 85%; top: 65%; --tx: -15px; --ty: 18px; animation-duration: 9s; animation-delay: 2.8s; }
.particle:nth-child(16) { left: 12%; top: 35%; --tx: 25px; --ty: -15px; animation-duration: 14s; animation-delay: 1.8s; }
.particle:nth-child(17) { left: 28%; top: 75%; --tx: -18px; --ty: 22px; animation-duration: 10s; animation-delay: 3.5s; }
.particle:nth-child(18) { left: 48%; top: 5%; --tx: 20px; --ty: -25px; animation-duration: 12s; animation-delay: 0.5s; }
.particle:nth-child(19) { left: 68%; top: 40%; --tx: -20px; --ty: 20px; animation-duration: 11s; animation-delay: 2.2s; }
.particle:nth-child(20) { left: 82%; top: 80%; --tx: 15px; --ty: -18px; animation-duration: 13s; animation-delay: 1.5s; }

/* Responsive: fewer particles on mobile */
@media (max-width: 768px) {
  .particle:nth-child(n+11) {
    display: none;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
    opacity: 0.2;
  }
}
```

**Step 2: Create hero section component**

File: `app/(marketing)/sections/hero-section.tsx`

```typescript
'use client'

import Link from 'next/link'
import { Fish, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from '../lib/animations'
import '../styles/particles.css'

export function HeroSection() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-ocean-deep via-ocean-dark to-ocean-deep">
      {/* Floating Particles Background */}
      <div className="particles-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 py-20 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={fadeInUp} className="mb-8">
          <Fish className="h-16 w-16 text-neon-teal mx-auto" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-bold text-text-primary mb-6 max-w-4xl mx-auto"
        >
          AI-Powered Sports Betting Research
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeInUp}
          className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-10"
        >
          Advanced prop analytics, AI insights, and transparent track records.
          Built for serious bettors.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="#waitlist">
            <Button variant="primary" size="lg" className="text-lg px-8 py-6">
              Start Free — No Card Required
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            className="text-lg px-8 py-6"
            onClick={scrollToFeatures}
          >
            See How It Works
            <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          variants={fadeInUp}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-text-muted"
          >
            <ArrowDown className="h-6 w-6" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
```

**Step 3: Commit**

```bash
git add app/\(marketing\)/sections/hero-section.tsx app/\(marketing\)/styles/particles.css
git commit -m "feat: add hero section with CSS particle animation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Build Social Proof Bar Component

**Files:**
- Create: `app/(marketing)/sections/social-proof-bar.tsx`

**Step 1: Create component**

File: `app/(marketing)/sections/social-proof-bar.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = end / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isInView, end])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export function SocialProofBar() {
  return (
    <section className="py-8 bg-ocean-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-center">
          <div>
            <p className="text-3xl font-bold text-text-primary">
              <CountUp end={2500} />+
            </p>
            <p className="text-text-secondary text-sm mt-1">Bettors Joined</p>
          </div>

          <div className="hidden md:block text-text-muted">|</div>

          <div>
            <p className="text-3xl font-bold text-positive">
              <CountUp end={85} suffix="%" />
            </p>
            <p className="text-text-secondary text-sm mt-1">Avg Hit Rate (Catch of Day)</p>
          </div>

          <div className="hidden md:block text-text-muted">|</div>

          <div>
            <p className="text-3xl font-bold text-neon-teal flex items-center justify-center gap-1">
              <CountUp end={4.8} />
              <span>★</span>
            </p>
            <p className="text-text-secondary text-sm mt-1">User Rating</p>
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/sections/social-proof-bar.tsx
git commit -m "feat: add social proof bar with count-up animation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Build Feature Showcase Component

**Files:**
- Create: `app/(marketing)/sections/feature-showcase.tsx`

**Step 1: Create component**

File: `app/(marketing)/sections/feature-showcase.tsx`

```typescript
'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeInLeft, fadeInRight } from '../lib/animations'
import { CatchOfDayMockup } from '../mockups/catch-of-day-mockup'
import { PropFinderMockup } from '../mockups/prop-finder-mockup'
import { AiAnalysisMockup } from '../mockups/ai-analysis-mockup'
import { LeaderboardMockup } from '../mockups/leaderboard-mockup'

interface Feature {
  title: string
  description: string
  mockup: React.ReactNode
  direction: 'left' | 'right'
}

function FeatureRow({ title, description, mockup, direction }: Feature) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-12 items-center ${
        direction === 'right' ? 'md:flex-row-reverse' : ''
      }`}
    >
      {/* Text Content */}
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={direction === 'left' ? fadeInLeft : fadeInRight}
        className={direction === 'right' ? 'md:order-2' : ''}
      >
        <h3 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {title}
        </h3>
        <p className="text-lg text-text-secondary leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Mockup */}
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={direction === 'left' ? fadeInRight : fadeInLeft}
        className={direction === 'right' ? 'md:order-1' : ''}
      >
        {mockup}
      </motion.div>
    </div>
  )
}

export function FeatureShowcase() {
  const features: Feature[] = [
    {
      title: '🐟 Catch of the Day',
      description:
        'Every morning, our AI analyzes thousands of player props and surfaces the highest-value plays. No spreadsheets, no guesswork—just data-driven picks with transparent hit rates and matchup analysis.',
      mockup: <CatchOfDayMockup />,
      direction: 'left',
    },
    {
      title: '📊 Prop Finder',
      description:
        'Filter and compare every player prop across all major sportsbooks. See real-time odds, historical hit rates, and line movements in one unified dashboard. Find edges the market is missing.',
      mockup: <PropFinderMockup />,
      direction: 'right',
    },
    {
      title: '🤖 AI Analysis',
      description:
        'Tap any prop for instant AI-powered breakdowns. Our models analyze recent form, matchup history, defensive rankings, and betting trends to quantify value. Know the "why" behind every pick.',
      mockup: <AiAnalysisMockup />,
      direction: 'left',
    },
    {
      title: '🏆 Community & Leaderboard',
      description:
        'Post your picks, track your record, and climb the rankings. Follow sharp bettors with proven track records. Full transparency—no one can hide losses or inflate stats.',
      mockup: <LeaderboardMockup />,
      direction: 'right',
    },
  ]

  return (
    <section id="features" className="py-24 bg-ocean-dark">
      <div className="container mx-auto px-4">
        <div className="space-y-32">
          {features.map((feature, idx) => (
            <FeatureRow key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/sections/feature-showcase.tsx
git commit -m "feat: add feature showcase with alternating layout

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Build How It Works Component

**Files:**
- Create: `app/(marketing)/sections/how-it-works.tsx`

**Step 1: Create component**

File: `app/(marketing)/sections/how-it-works.tsx`

```typescript
'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeInUp } from '../lib/animations'

interface Step {
  number: number
  title: string
  description: string
}

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const steps: Step[] = [
    {
      number: 1,
      title: 'Browse Today's Slate',
      description: 'See all games, props, and odds in one dashboard.',
    },
    {
      number: 2,
      title: 'Get AI Insights',
      description: 'Our AI analyzes hit rates, trends, and matchups to find value.',
    },
    {
      number: 3,
      title: 'Make Smarter Picks',
      description: 'Post your picks, track your results, and climb the leaderboard.',
    },
  ]

  return (
    <section className="py-24 bg-ocean-deep">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            How It Works
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Three simple steps to smarter betting
          </p>
        </motion.div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-border">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-teal/50 to-transparent"></div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-3 gap-8 relative">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.number}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  variants={fadeInUp}
                  transition={{ delay: idx * 0.2 }}
                  className="text-center"
                >
                  {/* Number Circle */}
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-full bg-ocean-card border-2 border-neon-teal flex items-center justify-center shadow-neon-glow">
                      <span className="text-4xl font-bold text-neon-teal">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden space-y-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeInUp}
              transition={{ delay: idx * 0.2 }}
              className="flex items-start gap-6"
            >
              {/* Number Circle */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-ocean-card border-2 border-neon-teal flex items-center justify-center shadow-neon-glow-sm">
                  <span className="text-2xl font-bold text-neon-teal">
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="pt-2">
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/sections/how-it-works.tsx
git commit -m "feat: add how it works section with timeline

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Build Comparison Section Component

**Files:**
- Create: `app/(marketing)/sections/comparison-section.tsx`

**Step 1: Create component**

File: `app/(marketing)/sections/comparison-section.tsx`

```typescript
'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeInUp } from '../lib/animations'
import { X, Check } from 'lucide-react'

export function ComparisonSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const comparisons = [
    { other: 'Walls of data with no direction', fysh: 'AI tells you what matters' },
    { other: '$80-130/month for advanced features', fysh: 'Powerful free tier, Pro at $9.99/mo' },
    { other: 'Research alone in silence', fysh: 'Community picks, leaderboards, social proof' },
    { other: 'Generic dashboards', fysh: 'Clean, modern design built for speed' },
  ]

  return (
    <section ref={ref} className="py-24 bg-ocean-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Why Bettors Are Switching to FYSH
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Built for serious bettors, priced for everyone
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {comparisons.map((comparison, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {/* Others Column */}
                <div className="bg-ocean-dark border border-border rounded-lg p-4 flex items-start gap-3">
                  <X className="h-5 w-5 text-negative flex-shrink-0 mt-0.5" />
                  <p className="text-text-muted text-sm">{comparison.other}</p>
                </div>

                {/* FYSH Column */}
                <div className="bg-ocean-deep border-2 border-neon-teal/50 rounded-lg p-4 flex items-start gap-3 shadow-neon-glow-sm">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <p className="text-text-primary text-sm font-semibold">{comparison.fysh}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/sections/comparison-section.tsx
git commit -m "feat: add comparison section highlighting value props

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Build Pricing Section Component

**Files:**
- Create: `app/(marketing)/sections/pricing-section.tsx`

**Step 1: Create component**

File: `app/(marketing)/sections/pricing-section.tsx`

```typescript
'use client'

import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { fadeInUp, scaleOnHover } from '../lib/animations'
import Link from 'next/link'

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 bg-ocean-deep">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            Start free. Upgrade when you're ready.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-ocean-card border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-neon-teal focus:ring-offset-2 focus:ring-offset-ocean-deep"
              aria-label="Toggle billing period"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-neon-teal transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>
              Annual <Badge className="ml-2 bg-positive/20 text-positive border-0 text-xs">Save 33%</Badge>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 h-full flex flex-col">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-text-primary">$0</span>
                <span className="text-text-secondary">/month</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Today's games & odds</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Catch of the Day (daily AI picks)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">3 AI prop analyses per day</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Community feed (read only)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Post up to 3 picks per day</span>
                </li>
              </ul>

              <Link href="#waitlist">
                <Button variant="secondary" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            whileHover="hover"
            variants={scaleOnHover}
          >
            <Card className="p-8 h-full flex flex-col border-2 border-neon-teal shadow-neon-glow relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-neon-teal text-ocean-deep font-bold px-4 py-1">
                MOST POPULAR
              </Badge>

              <h3 className="text-2xl font-bold text-text-primary mb-2">FYSH Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-text-primary">
                  ${isAnnual ? '6.67' : '9.99'}
                </span>
                <span className="text-text-secondary">/month</span>
                {isAnnual && (
                  <p className="text-sm text-text-muted mt-1">Billed annually at $79.99/yr</p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-primary font-semibold">Everything in Free, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Unlimited AI prop analyses</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Unlimited picks</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Full prop finder with advanced filters</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Parlay evaluator (AI-powered)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Line movement alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Early access to new features</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">Ad-free experience</span>
                </li>
              </ul>

              <Link href="#waitlist">
                <Button variant="primary" className="w-full">
                  Start 7-Day Free Trial
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/sections/pricing-section.tsx
git commit -m "feat: add pricing section with monthly/annual toggle

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Build Waitlist Section Component

**Files:**
- Create: `app/(marketing)/sections/waitlist-section.tsx`

**Step 1: Create component**

File: `app/(marketing)/sections/waitlist-section.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fadeInUp } from '../lib/animations'
import { z } from 'zod'

const emailSchema = z.string().email('Please enter a valid email address')

export function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ position: number; referralCode: string } | null>(null)
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  // Fetch waitlist count on mount
  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => setWaitlistCount(data.count))
      .catch(() => {}) // Silently fail
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate email
    const validation = emailSchema.safeParse(email)
    if (!validation.success) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to join waitlist')
        return
      }

      setSuccess({ position: data.position, referralCode: data.referralCode })
      setWaitlistCount(prev => (prev !== null ? prev + 1 : null))
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="waitlist" ref={ref} className="py-24 bg-ocean-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
        >
          <Card className="max-w-2xl mx-auto p-8 md:p-12 text-center shadow-neon-glow">
            {!success ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  Join the Early Access
                </h2>
                <p className="text-lg text-text-secondary mb-8">
                  Be one of the first to use FYSH. Early members get 30 days of Pro free.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg py-6"
                    disabled={isSubmitting}
                  />

                  {error && (
                    <p className="text-negative text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </Button>
                </form>

                {waitlistCount !== null && (
                  <p className="text-text-muted text-sm mt-6">
                    {waitlistCount.toLocaleString()} bettors on the waitlist
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-text-primary">
                  You're #{success.position} on the waitlist!
                </h3>
                <p className="text-lg text-text-secondary">
                  Check your email for next steps.
                </p>

                <Card className="bg-ocean-card p-4 mt-6">
                  <p className="text-sm text-text-secondary mb-2">Your referral link:</p>
                  <code className="text-neon-teal text-sm break-all">
                    fysh.bet/ref/{success.referralCode}
                  </code>
                  <p className="text-xs text-text-muted mt-2">
                    Share to move up the list!
                  </p>
                </Card>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/sections/waitlist-section.tsx
git commit -m "feat: add waitlist section with email capture form

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 15: Build FAQ Section Component

**Files:**
- Create: `app/(marketing)/sections/faq-section.tsx`

**Step 1: Create component**

File: `app/(marketing)/sections/faq-section.tsx`

```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { fadeInUp } from '../lib/animations'

interface FAQ {
  question: string
  answer: string
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const faqs: FAQ[] = [
    {
      question: 'Is FYSH a sportsbook?',
      answer: 'No. FYSH is a research and analysis platform. We help you find the best bets — you place them on your preferred sportsbook.',
    },
    {
      question: 'What sports do you cover?',
      answer: 'We currently cover NBA, NFL, MLB, and NHL, with college sports coming soon.',
    },
    {
      question: 'How does the AI analysis work?',
      answer: 'We use advanced AI to analyze player stats, trends, matchups, and odds to surface insights that would take hours to find manually. Think of it as having a team of analysts working for you.',
    },
    {
      question: 'Can I really use it for free?',
      answer: 'Yes. The free tier gives you daily AI picks, basic prop research, and community access. Pro unlocks unlimited analysis and advanced features.',
    },
    {
      question: 'How is FYSH different from other tools?',
      answer: 'Three things: AI that actually explains the "why" behind picks, a social community with transparent track records, and a price that doesn\'t require a second mortgage.',
    },
  ]

  return (
    <section ref={ref} className="py-24 bg-ocean-deep">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left bg-ocean-card border border-border rounded-lg p-6 hover:border-neon-teal/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-text-secondary flex-shrink-0 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-text-secondary mt-4 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/sections/faq-section.tsx
git commit -m "feat: add FAQ section with accordion animation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 16: Build Footer CTA Component

**Files:**
- Create: `app/(marketing)/sections/footer-cta.tsx`

**Step 1: Create component**

File: `app/(marketing)/sections/footer-cta.tsx`

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function FooterCTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-ocean-dark to-ocean-deep">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
          Ready to Reel In Smarter Bets?
        </h2>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          Join thousands of bettors using data-driven insights to find value.
        </p>
        <Link href="#waitlist">
          <Button variant="primary" size="lg" className="text-lg px-12 py-6">
            Start Free Today
          </Button>
        </Link>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/sections/footer-cta.tsx
git commit -m "feat: add footer CTA section

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 17: Compose Main Landing Page

**Files:**
- Modify: `app/(marketing)/page.tsx`

**Step 1: Replace existing page with new composition**

File: `app/(marketing)/page.tsx`

```typescript
import { HeroSection } from './sections/hero-section'
import { SocialProofBar } from './sections/social-proof-bar'
import { FeatureShowcase } from './sections/feature-showcase'
import { HowItWorks } from './sections/how-it-works'
import { ComparisonSection } from './sections/comparison-section'
import { PricingSection } from './sections/pricing-section'
import { WaitlistSection } from './sections/waitlist-section'
import { FAQSection } from './sections/faq-section'
import { FooterCTA } from './sections/footer-cta'

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

**Step 2: Test the page**

```bash
npm run dev
```

Visit http://localhost:3000 and verify all sections render correctly.

**Step 3: Commit**

```bash
git add app/\(marketing\)/page.tsx
git commit -m "feat: compose landing page with all sections

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 18: Update Footer Component

**Files:**
- Modify: `components/layout/footer.tsx`

**Step 1: Expand footer with full link structure**

File: `components/layout/footer.tsx`

```typescript
import Link from 'next/link'
import { Fish } from 'lucide-react'

export function Footer() {
  const linkGroups = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/#pricing' },
        { label: 'Prop Finder', href: '/props' },
        { label: 'Leaderboard', href: '/leaderboard' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Responsible Gaming', href: '/responsible-gaming' },
      ],
    },
    {
      title: 'Social',
      links: [
        { label: 'Twitter/X', href: 'https://twitter.com/fysh' },
        { label: 'Discord', href: 'https://discord.gg/fysh' },
        { label: 'Instagram', href: 'https://instagram.com/fysh' },
      ],
    },
  ]

  return (
    <footer className="border-t border-border bg-ocean-dark">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Fish className="h-6 w-6 text-neon-teal" />
              <span className="text-lg font-bold text-text-primary">FYSH</span>
            </div>
            <p className="text-sm text-text-muted">
              Bet smarter, not harder.
            </p>
          </div>

          {/* Link Groups */}
          {linkGroups.map((group, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-text-primary mb-3">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border text-center md:text-left">
          <p className="text-sm text-text-muted mb-2">
            © {new Date().getFullYear()} FYSH. Bet smarter, not harder. 🐟
          </p>
          <p className="text-xs text-text-muted">
            FYSH is a sports betting research tool and does not facilitate actual wagering.
            Please gamble responsibly.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

**Step 2: Commit**

```bash
git add components/layout/footer.tsx
git commit -m "feat: expand footer with complete link structure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 19: Add Performance Optimizations

**Files:**
- Modify: `app/(marketing)/layout.tsx`

**Step 1: Add metadata and performance optimizations**

File: `app/(marketing)/layout.tsx`

```typescript
import { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'FYSH — AI-Powered Sports Betting Research',
  description: 'Find smarter player props with AI analysis, hit rate data, and community picks. Free to start. Stop guessing, start fishing.',
  keywords: 'sports betting, player props, betting research, AI sports betting, prop finder, betting tools, sports analytics',
  openGraph: {
    title: 'FYSH — Reel in Smarter Bets',
    description: 'AI-powered player prop analysis, hit rates, and community picks. The betting research tool that actually helps you win.',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FYSH — AI-Powered Sports Betting Research',
    description: 'Player props, AI analysis, community picks. Free to start.',
    images: ['/twitter-card.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(marketing\)/layout.tsx
git commit -m "feat: add SEO metadata and OpenGraph tags

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 20: Final Testing and Validation

**Files:**
- None (testing only)

**Step 1: Run development server**

```bash
npm run dev
```

**Step 2: Test checklist**

- [ ] Page loads at http://localhost:3000
- [ ] All 9 sections render correctly
- [ ] Hero particles animate smoothly
- [ ] Scroll animations trigger when sections enter viewport
- [ ] Social proof count-up works
- [ ] Pricing toggle switches between monthly/annual
- [ ] FAQ accordion expands/collapses
- [ ] Waitlist form validates email
- [ ] Waitlist form submits successfully
- [ ] Success message shows position and referral code
- [ ] Mobile responsive (test at 375px, 768px, 1440px)
- [ ] Reduced motion: animations disabled with `prefers-reduced-motion`

**Step 3: Test waitlist API**

```bash
curl -X POST http://localhost:3000/api/waitlist -H "Content-Type: application/json" -d '{"email":"test@example.com"}'
```

Expected: `{"success":true,"position":1,"referralCode":"ABC123"}`

**Step 4: Run Lighthouse audit**

Open DevTools → Lighthouse → Run audit

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

**Step 5: Fix any issues found**

If Lighthouse shows issues:
- Optimize images (use next/image)
- Add missing alt text
- Fix contrast issues
- Reduce JavaScript bundle size

**Step 6: Final commit**

```bash
git add .
git commit -m "test: verify landing page meets performance targets

All sections rendering correctly, animations smooth, Lighthouse > 90.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria Checklist

- [ ] Landing page loads < 2s on mobile
- [ ] All sections render correctly (375px, 768px, 1440px)
- [ ] Hero is visually striking with particle animation
- [ ] Waitlist form captures emails and stores in database
- [ ] All animations smooth (60fps)
- [ ] Lighthouse performance > 90
- [ ] Professional, data-focused copy throughout
- [ ] High-fidelity mockups look production-ready
- [ ] Reduced motion support works
- [ ] Accessible (semantic HTML, ARIA labels, keyboard nav)

---

**End of Implementation Plan**
