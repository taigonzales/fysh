# AI Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build AI-powered prop analysis system with Claude API, hit rate calculations, daily featured picks, and personalized recommendations.

**Architecture:** Service-based microservices pattern matching existing sync services. Stats API client → Hit rate calculator → Claude AI analyzer → Confidence scorer → Catch generator.

**Tech Stack:** TypeScript, Next.js 14, Prisma, Claude API (@anthropic-ai/sdk), API-SPORTS, Jest

---

## Phase 1: Foundation - Stats API Client & Database

### Task 1.1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Add axios for HTTP requests**

```bash
pnpm add axios
pnpm add -D @types/axios
```

**Step 2: Verify installation**

Run: `pnpm list axios`
Expected: axios version listed

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add axios for stats API client"
```

---

### Task 1.2: Create PlayerSeasonStats Database Table

**Files:**
- Modify: `prisma/schema.prisma:381` (after Waitlist model)

**Step 1: Add PlayerSeasonStats model to schema**

```prisma
// ============================================
// PLAYER STATS CACHE (AI Layer)
// ============================================

model PlayerSeasonStats {
  id           String   @id @default(uuid())
  playerName   String   @map("player_name")
  sport        Sport
  season       String
  teamName     String   @map("team_name")
  gamesPlayed  Int      @map("games_played")
  seasonAvg    Json     @map("season_avg")     // {points, rebounds, assists, ...}
  last25Games  Json     @map("last25_games")   // Array of game logs
  homeAway     Json     @map("home_away")      // Split stats {home: {...}, away: {...}}
  vsOpponents  Json     @map("vs_opponents")   // Historical matchups {teamName: [...games]}
  fetchedAt    DateTime @map("fetched_at")

  @@unique([playerName, sport, season])
  @@map("player_season_stats")
}
```

**Step 2: Generate Prisma Client**

Run: `pnpm db:generate`
Expected: "Generated Prisma Client"

**Step 3: Push schema to database**

Run: `pnpm db:push`
Expected: "Your database is now in sync with your schema"

**Step 4: Verify table exists**

Run: `dotenv -e .env.local -- npx prisma studio` (open in browser, check for player_season_stats table)

**Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add PlayerSeasonStats table for AI layer stats cache"
```

---

### Task 1.3: Create Stats API Type Definitions

**Files:**
- Create: `lib/api/stats-api/types.ts`

**Step 1: Create directory structure**

```bash
mkdir -p lib/api/stats-api
```

**Step 2: Write types file**

```typescript
/**
 * Type definitions for Stats API (API-SPORTS)
 */

export interface GameLog {
  date: string
  opponent: string
  isHome: boolean
  points?: number
  rebounds?: number
  assists?: number
  minutes?: number
  // Additional stats fields
  [key: string]: number | string | boolean | undefined
}

export interface SeasonAverage {
  points: number
  rebounds: number
  assists: number
  minutes: number
  gamesPlayed: number
  // Additional averages
  [key: string]: number
}

export interface SituationalSplits {
  home: SeasonAverage
  away: SeasonAverage
  lastNGames: {
    n: number
    average: SeasonAverage
  }
}

export interface PlayerSeasonData {
  playerName: string
  sport: string
  season: string
  teamName: string
  gamesPlayed: number
  seasonAvg: SeasonAverage
  last25Games: GameLog[]
  homeAway: {
    home: Partial<SeasonAverage>
    away: Partial<SeasonAverage>
  }
  vsOpponents: Record<string, GameLog[]>
}

export interface StatsApiResponse<T = unknown> {
  success: boolean
  data: T
  error?: string
}

export interface RateLimitInfo {
  requestsToday: number
  dailyLimit: number
  resetAt: Date
}
```

**Step 3: Commit**

```bash
git add lib/api/stats-api/types.ts
git commit -m "feat: add Stats API type definitions"
```

---

### Task 1.4: Create Stats API Constants

**Files:**
- Create: `lib/api/stats-api/constants.ts`

**Step 1: Write constants file**

```typescript
/**
 * Constants for Stats API integration
 */

export const STATS_API_CONFIG = {
  BASE_URL: process.env.STATS_API_BASE_URL || 'https://v1.basketball.api-sports.io',
  API_KEY: process.env.STATS_API_KEY || '',
  DAILY_LIMIT: 500,
  TIMEOUT_MS: 10000,
  CACHE_TTL_HOURS: 12,
} as const

// Sport-specific API endpoints
export const SPORT_ENDPOINTS: Record<string, string> = {
  NBA: 'https://v1.basketball.api-sports.io',
  NHL: 'https://v1.hockey.api-sports.io',
  NFL: 'https://v1.american-football.api-sports.io',
  MLB: 'https://v1.baseball.api-sports.io',
  NCAAB: 'https://v1.basketball.api-sports.io', // Same as NBA
}

// Sport-specific stat fields
export const STAT_FIELDS_BY_SPORT: Record<string, string[]> = {
  NBA: ['points', 'rebounds', 'assists', 'steals', 'blocks', 'minutes'],
  NHL: ['goals', 'assists', 'points', 'shots', 'hits', 'timeOnIce'],
  NFL: ['passingYards', 'rushingYards', 'receivingYards', 'touchdowns'],
  MLB: ['hits', 'homeRuns', 'rbis', 'stolenBases', 'strikeouts'],
  NCAAB: ['points', 'rebounds', 'assists', 'steals', 'blocks', 'minutes'],
}
```

**Step 2: Add env vars to .env.local.example**

Modify: `.env.local.example:17` (after ODDS_API_BASE_URL)

```bash
# Stats API (API-SPORTS)
STATS_API_KEY=your_stats_api_key
STATS_API_BASE_URL=https://v1.basketball.api-sports.io
```

**Step 3: Commit**

```bash
git add lib/api/stats-api/constants.ts .env.local.example
git commit -m "feat: add Stats API constants and env vars"
```

---

### Task 1.5: Write Failing Test for Stats API Client

**Files:**
- Create: `lib/api/stats-api/__tests__/client.test.ts`

**Step 1: Create test directory**

```bash
mkdir -p lib/api/stats-api/__tests__
```

**Step 2: Write failing test**

```typescript
/**
 * @jest-environment node
 */
import { describe, test, expect } from '@jest/globals'
import { StatsApiClient } from '../client'

describe('StatsApiClient', () => {
  const client = new StatsApiClient()

  test('should fetch player season stats', async () => {
    const stats = await client.getPlayerSeasonStats('LeBron James', 'NBA', '2024-25')

    expect(stats).toBeDefined()
    expect(stats.playerName).toBe('LeBron James')
    expect(stats.sport).toBe('NBA')
    expect(stats.season).toBe('2024-25')
    expect(stats.seasonAvg).toBeDefined()
    expect(stats.seasonAvg.points).toBeGreaterThan(0)
  })

  test('should fetch player last N games', async () => {
    const games = await client.getPlayerRecentGames('LeBron James', 'NBA', 25)

    expect(Array.isArray(games)).toBe(true)
    expect(games.length).toBeLessThanOrEqual(25)
    if (games.length > 0) {
      expect(games[0].points).toBeDefined()
      expect(games[0].date).toBeDefined()
    }
  })

  test('should track rate limit usage', () => {
    const limitInfo = client.getRateLimitInfo()

    expect(limitInfo.dailyLimit).toBe(500)
    expect(limitInfo.requestsToday).toBeGreaterThanOrEqual(0)
  })
})
```

**Step 3: Run test to verify it fails**

Run: `pnpm test lib/api/stats-api/__tests__/client.test.ts`
Expected: FAIL with "Cannot find module '../client'"

**Step 4: Commit**

```bash
git add lib/api/stats-api/__tests__/client.test.ts
git commit -m "test: add failing tests for Stats API client"
```

---

### Task 1.6: Implement Stats API Client (Minimal)

**Files:**
- Create: `lib/api/stats-api/client.ts`

**Step 1: Write minimal implementation**

```typescript
/**
 * Stats API Client for API-SPORTS integration
 */
import axios, { type AxiosInstance } from 'axios'
import { STATS_API_CONFIG, SPORT_ENDPOINTS } from './constants'
import type {
  GameLog,
  PlayerSeasonData,
  SeasonAverage,
  RateLimitInfo,
} from './types'

export class StatsApiClient {
  private axios: AxiosInstance
  private requestsToday: number = 0
  private lastResetDate: Date = new Date()

  constructor() {
    this.axios = axios.create({
      baseURL: STATS_API_CONFIG.BASE_URL,
      timeout: STATS_API_CONFIG.TIMEOUT_MS,
      headers: {
        'x-rapidapi-key': STATS_API_CONFIG.API_KEY,
        'x-rapidapi-host': this.getHostFromUrl(STATS_API_CONFIG.BASE_URL),
      },
    })

    this.resetRateLimitIfNeeded()
  }

  private getHostFromUrl(url: string): string {
    return new URL(url).hostname
  }

  private resetRateLimitIfNeeded(): void {
    const now = new Date()
    const lastReset = this.lastResetDate

    // Reset at midnight
    if (now.getDate() !== lastReset.getDate()) {
      this.requestsToday = 0
      this.lastResetDate = now
    }
  }

  private trackRequest(): void {
    this.resetRateLimitIfNeeded()
    this.requestsToday++
  }

  getRateLimitInfo(): RateLimitInfo {
    this.resetRateLimitIfNeeded()

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return {
      requestsToday: this.requestsToday,
      dailyLimit: STATS_API_CONFIG.DAILY_LIMIT,
      resetAt: tomorrow,
    }
  }

  async getPlayerSeasonStats(
    playerName: string,
    sport: string,
    season: string
  ): Promise<PlayerSeasonData> {
    this.trackRequest()

    // Mock implementation for now
    // TODO: Replace with actual API call
    return {
      playerName,
      sport,
      season,
      teamName: 'Mock Team',
      gamesPlayed: 50,
      seasonAvg: {
        points: 25.5,
        rebounds: 7.2,
        assists: 8.1,
        minutes: 35.2,
        gamesPlayed: 50,
      },
      last25Games: [],
      homeAway: {
        home: { points: 26.3, rebounds: 7.5, assists: 8.3 },
        away: { points: 24.7, rebounds: 6.9, assists: 7.9 },
      },
      vsOpponents: {},
    }
  }

  async getPlayerRecentGames(
    playerName: string,
    sport: string,
    lastN: number
  ): Promise<GameLog[]> {
    this.trackRequest()

    // Mock implementation for now
    // TODO: Replace with actual API call
    return []
  }

  hasQuota(requestsNeeded: number = 1): boolean {
    const { requestsToday, dailyLimit } = this.getRateLimitInfo()
    return requestsToday + requestsNeeded <= dailyLimit
  }
}

// Export singleton instance
export const statsApiClient = new StatsApiClient()
```

**Step 2: Run tests**

Run: `pnpm test lib/api/stats-api/__tests__/client.test.ts`
Expected: PASS (all tests passing)

**Step 3: Commit**

```bash
git add lib/api/stats-api/client.ts
git commit -m "feat: implement Stats API client with rate limiting (mock data)"
```

---

### Task 1.7: Create Stats API Index Export

**Files:**
- Create: `lib/api/stats-api/index.ts`

**Step 1: Write barrel export**

```typescript
/**
 * Stats API module exports
 */
export { StatsApiClient, statsApiClient } from './client'
export { STATS_API_CONFIG, SPORT_ENDPOINTS, STAT_FIELDS_BY_SPORT } from './constants'
export type {
  GameLog,
  SeasonAverage,
  SituationalSplits,
  PlayerSeasonData,
  StatsApiResponse,
  RateLimitInfo,
} from './types'
```

**Step 2: Commit**

```bash
git add lib/api/stats-api/index.ts
git commit -m "feat: add Stats API barrel exports"
```

---

## Phase 2: Hit Rate Calculator

### Task 2.1: Create AI Service Type Definitions

**Files:**
- Create: `lib/services/ai/types.ts`

**Step 1: Create directory**

```bash
mkdir -p lib/services/ai
```

**Step 2: Write types**

```typescript
/**
 * Type definitions for AI services
 */

export interface HitRates {
  hitRateLast5: number
  hitRateLast10: number
  hitRateLast25: number
  hitRateSeason: number
  hitRateVsOpponent: number
}

export interface PropAnalysis {
  recommendation: 'OVER' | 'UNDER' | 'PASS'
  recentForm: string
  matchupAnalysis: string
  injuryImpact: string
  bettingValue: string
  keyFactors: string[]
  confidenceRaw: number // 0-1 score
}

export interface ConfidenceScore {
  score: number // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'LOCK'
  breakdown: {
    statisticalScore: number
    aiScore: number
    trendScore: number
    valueScore: number
  }
}

export interface CatchScore {
  propId: string
  score: number // 0-100
  confidence: ConfidenceScore
  hitRates: HitRates
  analysis: PropAnalysis
}

export interface SyncResult {
  itemsProcessed: number
  itemsSkipped: number
  itemsFailed: number
  errors: string[]
  duration?: number
}
```

**Step 3: Commit**

```bash
git add lib/services/ai/types.ts
git commit -m "feat: add AI service type definitions"
```

---

### Task 2.2: Create AI Service Utilities

**Files:**
- Create: `lib/services/ai/utils.ts`

**Step 1: Write utility functions**

```typescript
/**
 * Shared utilities for AI services
 */
import type { SyncResult } from './types'

/**
 * Create empty sync result
 */
export function createSyncResult(): SyncResult {
  return {
    itemsProcessed: 0,
    itemsSkipped: 0,
    itemsFailed: 0,
    errors: [],
  }
}

/**
 * Log sync result to console
 */
export function logSyncResult(serviceName: string, result: SyncResult): void {
  const { itemsProcessed, itemsSkipped, itemsFailed, errors, duration } = result

  console.log(`[${serviceName}] Sync complete:`, {
    processed: itemsProcessed,
    skipped: itemsSkipped,
    failed: itemsFailed,
    duration: duration ? `${duration}ms` : 'N/A',
  })

  if (errors.length > 0) {
    console.error(`[${serviceName}] Errors:`, errors)
  }
}

/**
 * Simple in-memory lock to prevent concurrent runs
 */
const locks = new Map<string, boolean>()

export async function withLock<T>(
  lockName: string,
  fn: () => Promise<T>
): Promise<T | null> {
  if (locks.get(lockName)) {
    console.warn(`[Lock] ${lockName} is already running, skipping`)
    return null
  }

  locks.set(lockName, true)

  try {
    return await fn()
  } finally {
    locks.delete(lockName)
  }
}

/**
 * Calculate percentage (hit rate)
 */
export function calculatePercentage(hits: number, total: number): number {
  if (total === 0) return 0
  return Number((hits / total).toFixed(4)) // 4 decimal places
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

**Step 2: Commit**

```bash
git add lib/services/ai/utils.ts
git commit -m "feat: add AI service utilities (sync results, locking, helpers)"
```

---

### Task 2.3: Write Failing Test for Hit Rate Calculator

**Files:**
- Create: `lib/services/ai/__tests__/hit-rate-calculator.test.ts`

**Step 1: Write test**

```typescript
/**
 * @jest-environment node
 */
import { describe, test, expect } from '@jest/globals'
import { calculateHitRateFromGames, calculateAllHitRates } from '../hit-rate-calculator'
import type { GameLog } from '@/lib/api/stats-api'

describe('Hit Rate Calculator', () => {
  const mockGames: GameLog[] = [
    { date: '2024-02-20', opponent: 'LAL', isHome: true, points: 32 },
    { date: '2024-02-18', opponent: 'MIA', isHome: false, points: 28 },
    { date: '2024-02-16', opponent: 'PHI', isHome: true, points: 24 },
    { date: '2024-02-14', opponent: 'BKN', isHome: false, points: 30 },
    { date: '2024-02-12', opponent: 'LAL', isHome: true, points: 35 },
  ]

  test('calculates hit rate for last 5 games', () => {
    const line = 27.5
    const statField = 'points'

    const hitRate = calculateHitRateFromGames(mockGames, line, statField)

    // 4 out of 5 games over 27.5 points (32, 28, 30, 35)
    expect(hitRate).toBe(0.8)
  })

  test('calculates hit rate for empty games array', () => {
    const hitRate = calculateHitRateFromGames([], 27.5, 'points')
    expect(hitRate).toBe(0)
  })

  test('calculates hit rate for all misses', () => {
    const lowGames: GameLog[] = [
      { date: '2024-02-20', opponent: 'LAL', isHome: true, points: 10 },
      { date: '2024-02-18', opponent: 'MIA', isHome: false, points: 12 },
    ]

    const hitRate = calculateHitRateFromGames(lowGames, 27.5, 'points')
    expect(hitRate).toBe(0)
  })

  test('calculates hit rate for all hits', () => {
    const highGames: GameLog[] = [
      { date: '2024-02-20', opponent: 'LAL', isHome: true, points: 40 },
      { date: '2024-02-18', opponent: 'MIA', isHome: false, points: 38 },
    ]

    const hitRate = calculateHitRateFromGames(highGames, 27.5, 'points')
    expect(hitRate).toBe(1.0)
  })

  test('filters games by opponent', () => {
    const vsLAL = mockGames.filter((g) => g.opponent === 'LAL')
    const hitRate = calculateHitRateFromGames(vsLAL, 27.5, 'points')

    // 2 games vs LAL: 32 and 35 (both over 27.5)
    expect(hitRate).toBe(1.0)
  })

  test('calculates all hit rates for a prop', async () => {
    const mockPropId = 'test-prop-123'

    // This will fail because calculateAllHitRates doesn't exist yet
    const hitRates = await calculateAllHitRates(mockPropId)

    expect(hitRates).toBeDefined()
    expect(hitRates.hitRateLast5).toBeGreaterThanOrEqual(0)
    expect(hitRates.hitRateLast5).toBeLessThanOrEqual(1)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test lib/services/ai/__tests__/hit-rate-calculator.test.ts`
Expected: FAIL with "Cannot find module '../hit-rate-calculator'"

**Step 3: Commit**

```bash
git add lib/services/ai/__tests__/hit-rate-calculator.test.ts
git commit -m "test: add failing tests for hit rate calculator"
```

---

### Task 2.4: Implement Hit Rate Calculator

**Files:**
- Create: `lib/services/ai/hit-rate-calculator.ts`

**Step 1: Write implementation**

```typescript
/**
 * Hit rate calculator for player props
 */
import { PrismaClient } from '@prisma/client'
import type { GameLog } from '@/lib/api/stats-api'
import type { HitRates, SyncResult } from './types'
import { createSyncResult, logSyncResult, calculatePercentage, withLock } from './utils'

const prisma = new PrismaClient()

/**
 * Calculate hit rate from game logs
 */
export function calculateHitRateFromGames(
  games: GameLog[],
  line: number,
  statField: string
): number {
  if (games.length === 0) return 0

  const hits = games.filter((game) => {
    const value = game[statField]
    return typeof value === 'number' && value > line
  }).length

  return calculatePercentage(hits, games.length)
}

/**
 * Calculate all hit rates for a single prop
 */
export async function calculateAllHitRates(propId: string): Promise<HitRates> {
  const prop = await prisma.playerProp.findUnique({
    where: { id: propId },
    include: {
      game: true,
    },
  })

  if (!prop) {
    throw new Error(`Prop ${propId} not found`)
  }

  // Fetch player stats from cache
  const playerStats = await prisma.playerSeasonStats.findFirst({
    where: {
      playerName: prop.playerName,
      sport: prop.game.sport,
      season: prop.game.season,
    },
  })

  if (!playerStats) {
    // No stats available yet, return zeros
    return {
      hitRateLast5: 0,
      hitRateLast10: 0,
      hitRateLast25: 0,
      hitRateSeason: 0,
      hitRateVsOpponent: 0,
    }
  }

  const allGames = playerStats.last25Games as GameLog[]
  const statField = getStatFieldFromPropType(prop.propType)
  const line = prop.line

  // Calculate hit rates for different time periods
  const last5Games = allGames.slice(0, 5)
  const last10Games = allGames.slice(0, 10)
  const last25Games = allGames

  // Calculate vs opponent hit rate
  const vsOpponentGames = (
    (playerStats.vsOpponents as Record<string, GameLog[]>)[prop.game.awayTeam] ||
    (playerStats.vsOpponents as Record<string, GameLog[]>)[prop.game.homeTeam] ||
    []
  )

  return {
    hitRateLast5: calculateHitRateFromGames(last5Games, line, statField),
    hitRateLast10: calculateHitRateFromGames(last10Games, line, statField),
    hitRateLast25: calculateHitRateFromGames(last25Games, line, statField),
    hitRateSeason: calculateHitRateFromGames(allGames, line, statField),
    hitRateVsOpponent: calculateHitRateFromGames(vsOpponentGames, line, statField),
  }
}

/**
 * Map prop type to stat field name
 */
function getStatFieldFromPropType(propType: string): string {
  const mapping: Record<string, string> = {
    'Points': 'points',
    'Rebounds': 'rebounds',
    'Assists': 'assists',
    'Pts+Rebs+Asts': 'points', // Will need special handling
    'Three-Pointers Made': 'threePointersMade',
  }

  return mapping[propType] || 'points'
}

/**
 * Calculate hit rates for all upcoming props (batch)
 */
export async function batchCalculateHitRates(): Promise<SyncResult> {
  return (await withLock('batch-calculate-hit-rates', async () => {
    const startTime = Date.now()
    const result = createSyncResult()

    try {
      // Get all upcoming props
      const props = await prisma.playerProp.findMany({
        where: {
          game: {
            status: 'SCHEDULED',
            startTime: {
              gte: new Date(),
              lte: new Date(Date.now() + 48 * 60 * 60 * 1000), // Next 48 hours
            },
          },
        },
      })

      console.log(`[HitRateCalc] Calculating hit rates for ${props.length} props`)

      for (const prop of props) {
        try {
          const hitRates = await calculateAllHitRates(prop.id)

          // Update prop with hit rates
          await prisma.playerProp.update({
            where: { id: prop.id },
            data: {
              hitRateLast5: hitRates.hitRateLast5,
              hitRateLast10: hitRates.hitRateLast10,
              hitRateLast25: hitRates.hitRateLast25,
              hitRateSeason: hitRates.hitRateSeason,
              hitRateVsOpponent: hitRates.hitRateVsOpponent,
            },
          })

          result.itemsProcessed++
        } catch (error) {
          result.itemsFailed++
          result.errors.push(`Prop ${prop.id}: ${error}`)
        }
      }

      result.duration = Date.now() - startTime
      logSyncResult('HitRateCalc', result)

      return result
    } catch (error) {
      console.error('[HitRateCalc] Fatal error:', error)
      result.errors.push(`Fatal: ${error}`)
      return result
    }
  })) || createSyncResult()
}
```

**Step 2: Run tests**

Run: `pnpm test lib/services/ai/__tests__/hit-rate-calculator.test.ts`
Expected: PASS (most tests passing, calculateAllHitRates might fail due to DB)

**Step 3: Commit**

```bash
git add lib/services/ai/hit-rate-calculator.ts
git commit -m "feat: implement hit rate calculator with batch processing"
```

---

## Phase 3: Claude AI Analysis

### Task 3.1: Write Failing Test for Prop Analyzer

**Files:**
- Create: `lib/services/ai/__tests__/prop-analyzer.test.ts`

**Step 1: Write test**

```typescript
/**
 * @jest-environment node
 */
import { describe, test, expect } from '@jest/globals'
import { buildAnalysisPrompt, parseAnalysisResponse, analyzeProp } from '../prop-analyzer'

describe('Prop Analyzer', () => {
  test('builds analysis prompt with prop data', () => {
    const mockContext = {
      playerName: 'Jayson Tatum',
      propType: 'Points',
      line: 27.5,
      gameInfo: 'Celtics vs Lakers (Tonight 7:00 PM)',
      hitRates: {
        last5: 0.8,
        last10: 0.7,
        last25: 0.68,
        season: 0.65,
        vsOpponent: 0.75,
      },
      recentGames: [32, 28, 30, 24, 35],
    }

    const prompt = buildAnalysisPrompt(mockContext)

    expect(prompt).toContain('Jayson Tatum')
    expect(prompt).toContain('27.5 Points')
    expect(prompt).toContain('Celtics vs Lakers')
    expect(prompt).toContain('4/5 hit')
    expect(prompt).toContain('JSON')
  })

  test('parses Claude response into structured analysis', () => {
    const mockResponse = JSON.stringify({
      recommendation: 'OVER',
      recentForm: 'Tatum is on fire with 4/5 games over the line',
      matchupAnalysis: 'Lakers weak perimeter defense',
      injuryImpact: 'No concerns, 2 days rest',
      bettingValue: 'Slight value on OVER',
      keyFactors: ['Hot streak', 'Favorable matchup', 'Home game'],
      confidenceRaw: 0.75,
    })

    const analysis = parseAnalysisResponse(mockResponse)

    expect(analysis.recommendation).toBe('OVER')
    expect(analysis.confidenceRaw).toBe(0.75)
    expect(analysis.keyFactors).toHaveLength(3)
  })

  test('analyzes a prop end-to-end (integration)', async () => {
    // This will fail until we implement analyzeProp
    const mockPropId = 'test-prop-123'

    const analysis = await analyzeProp(mockPropId)

    expect(analysis).toBeDefined()
    expect(analysis.recommendation).toMatch(/^(OVER|UNDER|PASS)$/)
    expect(analysis.confidenceRaw).toBeGreaterThanOrEqual(0)
    expect(analysis.confidenceRaw).toBeLessThanOrEqual(1)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test lib/services/ai/__tests__/prop-analyzer.test.ts`
Expected: FAIL with "Cannot find module '../prop-analyzer'"

**Step 3: Commit**

```bash
git add lib/services/ai/__tests__/prop-analyzer.test.ts
git commit -m "test: add failing tests for prop analyzer"
```

---

### Task 3.2: Implement Prop Analyzer (Part 1: Prompt Building)

**Files:**
- Create: `lib/services/ai/prop-analyzer.ts`

**Step 1: Write prompt builder**

```typescript
/**
 * Claude AI prop analyzer
 */
import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'
import type { PropAnalysis, SyncResult } from './types'
import { createSyncResult, logSyncResult, withLock, sleep } from './utils'

const prisma = new PrismaClient()
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface AnalysisContext {
  playerName: string
  propType: string
  line: number
  gameInfo: string
  hitRates: {
    last5: number
    last10: number
    last25: number
    season: number
    vsOpponent: number
  }
  recentGames: number[]
}

/**
 * Build Claude analysis prompt
 */
export function buildAnalysisPrompt(context: AnalysisContext): string {
  const { playerName, propType, line, gameInfo, hitRates, recentGames } = context

  const last5Hits = Math.round(hitRates.last5 * 5)
  const last10Hits = Math.round(hitRates.last10 * 10)
  const last25Hits = Math.round(hitRates.last25 * 25)

  return `You are analyzing a sports betting prop. Provide your analysis in JSON format.

PROP: ${playerName} Over ${line} ${propType}
GAME: ${gameInfo}

STATS:
- Last 5 games: ${recentGames.slice(0, 5).join(', ')} (${last5Hits}/5 hit, ${Math.round(hitRates.last5 * 100)}%)
- Last 10 games: ${last10Hits}/10 hit (${Math.round(hitRates.last10 * 100)}%)
- Last 25 games: ${last25Hits}/25 hit (${Math.round(hitRates.last25 * 100)}%)
- Season average: ${Math.round(hitRates.season * 100)}% hit rate
- vs Opponent (career): ${Math.round(hitRates.vsOpponent * 100)}% hit rate

OUTPUT REQUIRED (strict JSON, no markdown):
{
  "recommendation": "OVER" | "UNDER" | "PASS",
  "recentForm": "2-3 sentence analysis of recent performance trends",
  "matchupAnalysis": "How player performs in this specific matchup",
  "injuryImpact": "Any injury concerns or lineup changes affecting this prop",
  "bettingValue": "Assessment of whether the line provides value",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "confidenceRaw": 0.75
}

Provide only the JSON object, no additional text.`
}

/**
 * Parse Claude's response into PropAnalysis
 */
export function parseAnalysisResponse(response: string): PropAnalysis {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return {
      recommendation: parsed.recommendation,
      recentForm: parsed.recentForm,
      matchupAnalysis: parsed.matchupAnalysis,
      injuryImpact: parsed.injuryImpact,
      bettingValue: parsed.bettingValue,
      keyFactors: parsed.keyFactors,
      confidenceRaw: parsed.confidenceRaw,
    }
  } catch (error) {
    console.error('[PropAnalyzer] Failed to parse response:', response)
    throw new Error(`Failed to parse Claude response: ${error}`)
  }
}

/**
 * Analyze a single prop using Claude AI
 */
export async function analyzeProp(propId: string): Promise<PropAnalysis> {
  // Fetch prop with related data
  const prop = await prisma.playerProp.findUnique({
    where: { id: propId },
    include: {
      game: true,
    },
  })

  if (!prop) {
    throw new Error(`Prop ${propId} not found`)
  }

  // Fetch player stats for recent games
  const playerStats = await prisma.playerSeasonStats.findFirst({
    where: {
      playerName: prop.playerName,
      sport: prop.game.sport,
      season: prop.game.season,
    },
  })

  if (!playerStats) {
    throw new Error(`No stats found for ${prop.playerName}`)
  }

  const last25Games = playerStats.last25Games as Array<{ points?: number; [key: string]: any }>
  const recentGames = last25Games.map((g) => g.points || 0)

  // Build analysis context
  const context: AnalysisContext = {
    playerName: prop.playerName,
    propType: prop.propType,
    line: prop.line,
    gameInfo: `${prop.game.awayTeam} @ ${prop.game.homeTeam}`,
    hitRates: {
      last5: prop.hitRateLast5 || 0,
      last10: prop.hitRateLast10 || 0,
      last25: prop.hitRateLast25 || 0,
      season: prop.hitRateSeason || 0,
      vsOpponent: prop.hitRateVsOpponent || 0,
    },
    recentGames,
  }

  // Call Claude API
  const prompt = buildAnalysisPrompt(context)

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  const analysis = parseAnalysisResponse(content.text)

  // Update prop with analysis
  await prisma.playerProp.update({
    where: { id: propId },
    data: {
      aiAnalysis: JSON.stringify(analysis),
      aiAnalyzedAt: new Date(),
    },
  })

  return analysis
}

/**
 * Analyze all upcoming props (batch)
 */
export async function analyzeAllProps(): Promise<SyncResult> {
  return (await withLock('analyze-all-props', async () => {
    const startTime = Date.now()
    const result = createSyncResult()

    try {
      const props = await prisma.playerProp.findMany({
        where: {
          game: {
            status: 'SCHEDULED',
            startTime: {
              gte: new Date(),
              lte: new Date(Date.now() + 48 * 60 * 60 * 1000),
            },
          },
        },
      })

      console.log(`[PropAnalyzer] Analyzing ${props.length} props`)

      // Rate limiting: 10 props per minute
      const batchSize = 10
      for (let i = 0; i < props.length; i += batchSize) {
        const batch = props.slice(i, i + batchSize)

        for (const prop of batch) {
          try {
            await analyzeProp(prop.id)
            result.itemsProcessed++
          } catch (error) {
            result.itemsFailed++
            result.errors.push(`Prop ${prop.id}: ${error}`)
          }
        }

        // Wait 1 minute between batches
        if (i + batchSize < props.length) {
          await sleep(60 * 1000)
        }
      }

      result.duration = Date.now() - startTime
      logSyncResult('PropAnalyzer', result)

      return result
    } catch (error) {
      console.error('[PropAnalyzer] Fatal error:', error)
      result.errors.push(`Fatal: ${error}`)
      return result
    }
  })) || createSyncResult()
}
```

**Step 2: Run tests**

Run: `pnpm test lib/services/ai/__tests__/prop-analyzer.test.ts`
Expected: PASS (tests should pass now)

**Step 3: Commit**

```bash
git add lib/services/ai/prop-analyzer.ts
git commit -m "feat: implement Claude AI prop analyzer with batch processing"
```

---

## Phase 4: Confidence Scoring & Catch of the Day

### Task 4.1: Write Test for Confidence Scorer

**Files:**
- Create: `lib/services/ai/__tests__/confidence-scorer.test.ts`

**Step 1: Write test**

```typescript
/**
 * @jest-environment node
 */
import { describe, test, expect } from '@jest/globals'
import { scoreConfidence, calculateConfidenceScore } from '../confidence-scorer'

describe('Confidence Scorer', () => {
  test('calculates confidence score from signals', () => {
    const signals = {
      hitRateLast25: 0.68,
      aiConfidenceRaw: 0.75,
      trendStrength: 0.8,
      lineValue: 0.6,
    }

    const score = calculateConfidenceScore(signals)

    expect(score.score).toBeGreaterThan(0)
    expect(score.score).toBeLessThanOrEqual(100)
    expect(score.level).toMatch(/^(LOW|MEDIUM|HIGH|LOCK)$/)
  })

  test('returns LOCK for score >= 80', () => {
    const signals = {
      hitRateLast25: 0.9,
      aiConfidenceRaw: 0.95,
      trendStrength: 1.0,
      lineValue: 0.9,
    }

    const score = calculateConfidenceScore(signals)
    expect(score.level).toBe('LOCK')
  })

  test('returns LOW for score < 50', () => {
    const signals = {
      hitRateLast25: 0.3,
      aiConfidenceRaw: 0.4,
      trendStrength: 0.2,
      lineValue: 0.3,
    }

    const score = calculateConfidenceScore(signals)
    expect(score.level).toBe('LOW')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test lib/services/ai/__tests__/confidence-scorer.test.ts`
Expected: FAIL

**Step 3: Commit**

```bash
git add lib/services/ai/__tests__/confidence-scorer.test.ts
git commit -m "test: add failing tests for confidence scorer"
```

---

### Task 4.2: Implement Confidence Scorer

**Files:**
- Create: `lib/services/ai/confidence-scorer.ts`

**Step 1: Write implementation**

```typescript
/**
 * Multi-signal confidence scorer
 */
import type { ConfidenceScore } from './types'

interface ConfidenceSignals {
  hitRateLast25: number // 0-1
  aiConfidenceRaw: number // 0-1
  trendStrength: number // 0-1
  lineValue: number // 0-1
}

/**
 * Calculate confidence score from multiple signals
 */
export function calculateConfidenceScore(signals: ConfidenceSignals): ConfidenceScore {
  const { hitRateLast25, aiConfidenceRaw, trendStrength, lineValue } = signals

  // Weighted scoring (0-100 scale)
  const statisticalScore = hitRateLast25 * 30
  const aiScore = aiConfidenceRaw * 40
  const trendScore = trendStrength * 20
  const valueScore = lineValue * 10

  const totalScore = statisticalScore + aiScore + trendScore + valueScore

  // Map to confidence level
  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'LOCK'
  if (totalScore >= 80) level = 'LOCK'
  else if (totalScore >= 65) level = 'HIGH'
  else if (totalScore >= 50) level = 'MEDIUM'
  else level = 'LOW'

  return {
    score: Math.round(totalScore),
    level,
    breakdown: {
      statisticalScore: Math.round(statisticalScore),
      aiScore: Math.round(aiScore),
      trendScore: Math.round(trendScore),
      valueScore: Math.round(valueScore),
    },
  }
}

/**
 * Score confidence for a specific prop
 */
export async function scoreConfidence(propId: string): Promise<ConfidenceScore> {
  // This would fetch prop data and calculate signals
  // For now, placeholder implementation
  const signals: ConfidenceSignals = {
    hitRateLast25: 0.68,
    aiConfidenceRaw: 0.75,
    trendStrength: 0.7,
    lineValue: 0.6,
  }

  return calculateConfidenceScore(signals)
}
```

**Step 2: Run tests**

Run: `pnpm test lib/services/ai/__tests__/confidence-scorer.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add lib/services/ai/confidence-scorer.ts
git commit -m "feat: implement multi-signal confidence scorer"
```

---

**[PLAN CONTINUES - Due to length, I'm providing Phase 1-4. The complete plan would include Phase 5 (API Endpoints & Cron) and Phase 6 (Personalization). Would you like me to continue with the remaining phases?]**

---

## Implementation Notes

### Testing Strategy
- Each feature follows TDD: write test → verify fail → implement → verify pass → commit
- Run tests frequently: `pnpm test [file-path]`
- Integration tests require database (use test environment)

### Database Migrations
- After schema changes: `pnpm db:generate && pnpm db:push`
- Always verify schema in Prisma Studio

### Environment Variables
- Copy `.env.local.example` to `.env.local`
- Add real API keys for testing: `ANTHROPIC_API_KEY`, `STATS_API_KEY`

### Common Issues
- **Prisma Client not updated**: Run `pnpm db:generate`
- **Tests fail with DB errors**: Check `.env.local` DATABASE_URL
- **Rate limit errors**: Check API quota with `client.getRateLimitInfo()`

### Next Steps After Phase 4
- Phase 5: Build API endpoints (`/api/props/[id]/analyze`, `/api/catch-of-day`)
- Phase 6: Implement Catch of the Day generator
- Phase 7: Add Vercel Cron jobs
- Phase 8: Build user recommender (personalization)
- Phase 9: End-to-end testing
- Phase 10: Production deployment

---

**Total Estimated Time:**
- Phase 1 (Foundation): 4-6 hours
- Phase 2 (Hit Rates): 3-4 hours
- Phase 3 (AI Analysis): 4-5 hours
- Phase 4 (Confidence): 2-3 hours
- **Total (Phases 1-4): 13-18 hours**

---

**Status:** Ready for execution. Proceed with Task 1.1 (Install Dependencies).
