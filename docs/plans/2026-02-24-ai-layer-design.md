# FYSH Part 3: AI Layer Design

**Date:** 2026-02-24
**Status:** Approved
**Author:** Claude Code (Brainstorming Session)

---

## Overview

This document outlines the design for Part 3 of FYSH: the AI Layer. This system will provide AI-powered prop analysis, hit rate calculations, daily featured picks ("Catch of the Day"), and personalized recommendations using Claude API and external sports stats APIs.

**Key Features:**
1. Multi-angle AI analysis for all player props
2. Historical hit rate calculations (last 5/10/25 games, season, vs opponent)
3. Multi-signal confidence scoring (LOW/MEDIUM/HIGH/LOCK)
4. Daily "Catch of the Day" featured pick with multi-factor selection
5. Personalized prop recommendations for logged-in users
6. Continuous refresh (every 3 hours) to keep analysis current

---

## 1. Architecture Overview

### Service-Based Microservices Pattern

Following the existing sync service architecture, we'll create modular AI services:

```
lib/
├── api/
│   ├── odds-api/              # Existing - The Odds API client
│   └── stats-api/             # NEW - Sports stats API client
│       ├── client.ts          # API wrapper with rate limiting
│       ├── types.ts           # TypeScript interfaces
│       ├── transformers.ts    # Raw API → our data models
│       └── constants.ts       # API keys, base URLs, sport mappings
│
├── services/
│   ├── sync/                  # Existing - game/odds/props sync
│   └── ai/                    # NEW - AI analysis services
│       ├── stats-fetcher.ts       # Fetch player historical stats
│       ├── hit-rate-calculator.ts # Calculate prop hit rates
│       ├── prop-analyzer.ts       # Claude API analysis
│       ├── confidence-scorer.ts   # Multi-signal confidence
│       ├── catch-generator.ts     # Daily pick selection
│       ├── user-recommender.ts    # Personalized picks
│       ├── scheduler.ts           # Orchestrate AI workflows
│       ├── utils.ts               # Shared utilities
│       └── types.ts               # AI-specific types
```

**Key Principles:**
- Each service has single, clear responsibility
- Services are composable (can call each other)
- All external API calls go through dedicated clients
- Database writes through Prisma ORM only
- Scheduling coordinated by `scheduler.ts`

---

## 2. Stats API Integration

### Recommended Provider: API-SPORTS

**Why API-SPORTS:**
- Coverage: NBA, NHL, NFL, MLB, NCAAB (all required sports)
- Pricing: $15-30/month for Standard tier (~500-1000 requests/day)
- Data: Player stats, game logs, team stats, historical performance
- Documentation: Comprehensive REST API
- Reliability: 99.9% uptime SLA

### Comprehensive Data Collection

```typescript
class StatsApiClient {
  // Full season stats (all games)
  async getPlayerSeasonStats(playerId: string, season: string): Promise<FullSeasonStats>

  // Last N games (5, 10, 25 for different views)
  async getPlayerRecentGames(playerId: string, lastN: number): Promise<GameLog[]>

  // Career stats vs specific opponent
  async getPlayerVsOpponent(playerId: string, opponentTeam: string): Promise<H2HStats[]>

  // Advanced splits (home/away, rest days, back-to-backs)
  async getPlayerSituationalSplits(playerId: string, season: string): Promise<SituationalSplits>
}
```

### Hit Rate Data Sources

For each prop (e.g., "Player X Over 25.5 Points"):

1. **Last 5 games:** Short-term form
2. **Last 10 games:** Medium-term trend
3. **Last 25 games:** Statistically significant sample
4. **Full season:** Overall baseline
5. **vs Opponent:** Career performance against today's opponent
6. **Situational:** Home/away, days rest, starting/bench

### Data Storage Strategy

- Fetch once daily (5:00 AM) for all active players
- Store in new table: `player_season_stats`
- Calculate hit rates on-the-fly from stored game logs
- Cache calculations for 6 hours

### Rate Limiting

- Fetch full season data once daily (early morning)
- Update game logs after games complete
- ~200-300 API calls per day (within Standard tier)
- Redis cache for frequently accessed players

---

## 3. Database Schema Changes

### New Table: PlayerSeasonStats

```prisma
model PlayerSeasonStats {
  id           String   @id @default(uuid())
  playerName   String   @map("player_name")
  sport        Sport
  season       String
  teamName     String   @map("team_name")
  gamesPlayed  Int      @map("games_played")
  seasonAvg    Json     @map("season_avg")     // {points, rebounds, assists, ...}
  last25Games  Json     @map("last25_games")   // Array of game logs
  homeAway     Json     @map("home_away")      // Split stats
  vsOpponents  Json     @map("vs_opponents")   // Historical matchups
  fetchedAt    DateTime @map("fetched_at")

  @@unique([playerName, sport, season])
  @@map("player_season_stats")
}
```

### Existing Tables (Already Support AI)

- **PlayerProp:** Already has `hitRateLast5`, `hitRateLast10`, `hitRateLast25`, `hitRateSeason`, `hitRateVsOpponent`, `aiAnalysis`, `aiAnalyzedAt`
- **AiInsight:** Already supports `CATCH_OF_DAY`, `PROP_ANALYSIS`, `GAME_PREVIEW` types
- **Confidence enum:** Already defined (LOW, MEDIUM, HIGH, LOCK)

---

## 4. AI Services Design

### 1. stats-fetcher.ts - Player Statistics Synchronization

**Purpose:** Fetch and store comprehensive player stats from API-SPORTS

```typescript
export async function syncPlayerStats(): Promise<SyncResult>
```

**Process:**
1. Get all active players from upcoming props
2. Fetch full season stats + last 25 games for each player
3. Store in `player_season_stats` table
4. Return sync result

**Schedule:** Daily at 5:00 AM (before analysis starts)

---

### 2. hit-rate-calculator.ts - Prop Hit Rate Analysis

**Purpose:** Calculate hit rates for all prop lines using stored game logs

```typescript
export async function calculateHitRates(propId: string): Promise<HitRates>
export async function batchCalculateHitRates(): Promise<SyncResult>
```

**Calculates:**
- Last 5 games hit rate
- Last 10 games hit rate
- Last 25 games hit rate
- Full season hit rate
- vs Today's opponent (career)

**Example:**
```typescript
// For "Jayson Tatum Over 27.5 Points"
const last25Games = await getPlayerRecentGames(tatumId, 25)
const hitRateLast25 = last25Games.filter(g => g.points > 27.5).length / 25
// Returns: 0.68 (68% hit rate over last 25 games)
```

**Schedule:** Every 6 hours (after stats sync, before analysis)

---

### 3. prop-analyzer.ts - Claude AI Analysis

**Purpose:** Generate structured AI analysis for each prop using Claude API

```typescript
export async function analyzeProp(propId: string): Promise<PropAnalysis>
export async function analyzeAllProps(): Promise<SyncResult>
```

**Claude Prompt Structure:**
```
You are analyzing a sports betting prop. Provide analysis in JSON format.

PROP: Jayson Tatum Over 27.5 Points
GAME: Celtics vs Lakers (tonight 7pm)

STATS:
- Last 5: 29, 31, 24, 28, 32 (4/5 hit, 80%)
- Last 10: 7/10 hit (70%)
- Last 25: 17/25 hit (68%)
- Season Avg: 26.8 PPG (65% hit rate)
- vs Lakers (career): 6/8 hit (75%)

CONTEXT:
- Home game, 2 days rest
- Lakers rank 22nd in points allowed to SFs
- Tatum averaging 31.2 PPG last 5 games (trending up)

OUTPUT REQUIRED (JSON):
{
  "recommendation": "OVER" | "UNDER" | "PASS",
  "recentForm": "2-3 sentence analysis of last 5-25 games trend",
  "matchupAnalysis": "How player performs vs this opponent/defense",
  "injuryImpact": "Any injury concerns or lineup changes",
  "bettingValue": "Is the line fair, or is there value?",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "confidenceRaw": 0.75 // 0-1 score based on analysis
}
```

**Storage:** Structured data stored in `PlayerProp.aiAnalysis` (JSON field)

**Schedule:** Every 3 hours (6am, 9am, 12pm, 3pm, 6pm, 9pm)

---

### 4. confidence-scorer.ts - Multi-Signal Confidence Scoring

**Purpose:** Combine statistics, AI reasoning, and market signals into final confidence level

```typescript
export async function scoreConfidence(propId: string): Promise<Confidence>
```

**Scoring Algorithm:**
```typescript
// Weighted scoring (0-100 scale)
const score =
  (hitRateLast25 * 30) +           // 30% - statistical baseline
  (aiConfidenceRaw * 40) +         // 40% - AI holistic analysis
  (trendStrength * 20) +           // 20% - momentum (last 5 vs season)
  (lineValue * 10)                 // 10% - is line mispriced?

// Thresholds
if (score >= 80) return "LOCK"     // 80-100: Elite confidence
if (score >= 65) return "HIGH"     // 65-79: Strong confidence
if (score >= 50) return "MEDIUM"   // 50-64: Moderate confidence
return "LOW"                        // <50: Weak confidence
```

---

### 5. catch-generator.ts - Daily Featured Pick

**Purpose:** Select the single best prop as "Catch of the Day"

```typescript
export async function generateCatchOfDay(): Promise<AiInsight>
```

**Multi-Factor Scoring:**
```typescript
const catchScore =
  (confidence * 40) +              // 40% - confidence level
  (hitRateLast25 * 25) +          // 25% - statistical edge
  (lineValue * 20) +              // 20% - betting value (EV+)
  (popularity * 15)                // 15% - game visibility (primetime, playoffs)
```

**Process:**
1. Get all analyzed props for next 24 hours
2. Score each prop using multi-factor algorithm
3. Select highest-scoring prop
4. Generate detailed write-up using Claude
5. Store in `AiInsight` table (type: CATCH_OF_DAY)

**Schedule:** Daily at 9:00 AM (after morning analysis)

---

### 6. user-recommender.ts - Personalized Picks

**Purpose:** Generate personalized prop recommendations for individual users

```typescript
export async function getPersonalizedPicks(userId: string): Promise<AiInsight[]>
```

**Personalization Factors:**
- User's favorite sports (from preferences)
- Teams user frequently bets on (from pick history)
- Confidence levels user prefers
- Time of games (if user prefers primetime)

**Process:**
1. Get user's sport preferences, betting history
2. Filter props by user preferences
3. Apply same scoring algorithm as catch-of-day
4. Return top 3-5 personalized picks
5. Cache for 3 hours per user

**Invocation:** On-demand via API endpoint

---

### 7. scheduler.ts - Orchestration

**Purpose:** Coordinate all AI workflows in correct order

```typescript
export async function runDailyAiPipeline(): Promise<void>
```

**Daily Pipeline:**
```typescript
// Morning pipeline (5:00 AM)
await syncPlayerStats()           // Fetch latest stats

// Analysis pipeline (every 3 hours)
await batchCalculateHitRates()    // Calculate all hit rates
await analyzeAllProps()           // Claude analysis

// Daily picks (9:00 AM only)
await generateCatchOfDay()        // Select featured pick
```

---

## 5. Data Flow

### Flow 1: Daily Stats Sync & Analysis Pipeline

```
5:00 AM Cron
     ↓
stats-fetcher.ts
• Fetch player season stats (API-SPORTS)
• Fetch last 25 games for each player
• Store in player_season_stats table
     ↓
hit-rate-calculator.ts
• Load game logs from DB
• Calculate hit rates (5/10/25/season)
• Update PlayerProp table
     ↓
prop-analyzer.ts
• Load prop + hit rates + stats
• Build Claude prompt with context
• Call Claude API (batch 20 props)
• Parse structured JSON response
• Update PlayerProp.aiAnalysis
     ↓
confidence-scorer.ts
• Load AI analysis + hit rates
• Calculate confidence score (0-100)
• Map to enum (LOW/MEDIUM/HIGH/LOCK)
     ↓
catch-generator.ts (9:00 AM only)
• Score all analyzed props
• Select highest-scoring prop
• Generate detailed write-up (Claude)
• Store in AiInsight table
```

**Runs:** 5:00 AM (stats), then every 3 hours for analysis

### Flow 2: On-Demand Prop Analysis

```
User clicks "Analyze" on a prop
     ↓
GET /api/props/[id]/analyze
     ↓
Check: Is analysis fresh? (<3 hours)
• YES → Return cached aiAnalysis
• NO  → Continue to analysis
     ↓
prop-analyzer.ts (single prop)
• Fetch stats if missing
• Calculate hit rates if missing
• Call Claude API
• Update DB
• Return analysis
```

**Response time:** ~2-4 seconds

### Flow 3: Catch of the Day Retrieval

```
User loads homepage
     ↓
GET /api/catch-of-day
     ↓
Query AiInsight table
WHERE type = 'CATCH_OF_DAY'
AND publishedAt = today
     ↓
Return structured insight
```

**Response time:** <100ms (simple DB query)

---

## 6. Error Handling & Rate Limiting

### Stats API Error Handling

**Fallback Strategy:**
1. Try fresh API call
2. If rate limited → use cached data (up to 24 hours old)
3. If server error → retry 3x with exponential backoff
4. If still failing → use season averages as estimate
5. Log all failures for monitoring

### Claude API Error Handling

**Fallback Strategy:**
1. Try Claude API call
2. If rate limited → queue for retry in 5 minutes
3. If Claude is down → generate basic stats-only analysis
4. If prop has old analysis (<24h) → keep using it
5. Display "Analysis pending" in UI if no analysis available

### Rate Limiting - Stats API

**API-SPORTS limits:** 500-1000 requests/day

**Management:**
- Track requests per day
- Alert at 80% usage
- Skip non-critical updates if quota low
- Prioritize: active props > historical data > nice-to-have stats

### Rate Limiting - Claude API

**Anthropic limits:** ~10-50 requests/minute (tier-dependent)

**Batch Strategy:**
- Process 10 props per minute (within rate limits)
- Queue overflow props for next batch
- Priority queue: HIGH confidence props analyzed first

### Database Transaction Safety

**Principles:**
1. Use transactions for multi-row updates
2. Continue on individual failures (don't abort entire batch)
3. Log all errors with context
4. Return detailed sync results for monitoring

---

## 7. API Endpoints

### 1. GET /api/props/:id/analyze

**Purpose:** Get AI analysis for a specific prop

**Response:**
```json
{
  "success": true,
  "data": {
    "propId": "abc123",
    "playerName": "Jayson Tatum",
    "propType": "Points",
    "line": 27.5,
    "recommendation": "OVER",
    "confidence": "HIGH",
    "hitRates": {
      "last5": 0.80,
      "last10": 0.70,
      "last25": 0.68,
      "season": 0.65,
      "vsOpponent": 0.75
    },
    "analysis": {
      "recentForm": "...",
      "matchupAnalysis": "...",
      "injuryImpact": "...",
      "bettingValue": "...",
      "keyFactors": [...]
    },
    "analyzedAt": "2026-02-24T14:30:00Z",
    "cacheStatus": "fresh"
  }
}
```

**Caching:** Fresh (<3h), Stale (3-24h), Generated (new)

---

### 2. GET /api/catch-of-day

**Purpose:** Get today's featured "Catch of the Day" pick

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "insight123",
    "type": "CATCH_OF_DAY",
    "title": "🎯 Catch of the Day: Jayson Tatum Over 27.5 Points",
    "subtitle": "Celtics vs Lakers • Tonight 7:00 PM ET",
    "sport": "NBA",
    "confidence": "HIGH",
    "score": 87,
    "prop": {...},
    "analysis": {...},
    "hitRates": {...},
    "publishedAt": "2026-02-24T09:00:00Z",
    "expiresAt": "2026-02-24T19:00:00Z"
  }
}
```

**Caching:** Generated once daily at 9 AM, cached until game time

---

### 3. GET /api/recommendations

**Purpose:** Get personalized prop recommendations for logged-in user

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "recommendations": [
      {
        "rank": 1,
        "score": 84,
        "confidence": "HIGH",
        "prop": {...},
        "analysis": {...},
        "personalizedReason": "Based on your NBA preference and past picks"
      }
    ],
    "generatedAt": "2026-02-24T14:30:00Z",
    "cacheExpiry": "2026-02-24T17:30:00Z"
  }
}
```

**Caching:** 3 hours per user

---

### 4. POST /api/props/batch-analyze

**Purpose:** Trigger batch analysis (admin/cron only)

**Security:** Requires `ADMIN_API_KEY` or triggered by Vercel Cron

---

### 5. GET /api/props (ENHANCED)

**Purpose:** List props with AI filters

**New Query Params:**
- `hasAnalysis=true` - Only props with AI analysis
- `confidence=HIGH,LOCK` - Filter by confidence level
- `minHitRate=0.65` - Filter by hit rate threshold
- `sport=NBA` - Filter by sport

---

### 6. GET /api/stats/player/:name

**Purpose:** Get player stats and game logs (debugging/admin)

---

## 8. Scheduling & Cron Jobs

### Vercel Cron Configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/stats-sync",
      "schedule": "0 5 * * *"
    },
    {
      "path": "/api/cron/ai-analysis",
      "schedule": "0 6,9,12,15,18,21 * * *"
    },
    {
      "path": "/api/cron/catch-of-day",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Daily Timeline

```
02:00 AM → Cleanup (delete old data)
05:00 AM → Stats Sync (fetch player stats)
06:00 AM → AI Analysis (first run)
09:00 AM → AI Analysis + Catch of the Day
12:00 PM → AI Analysis (props refreshed)
03:00 PM → AI Analysis (lines moving)
06:00 PM → AI Analysis (evening games)
09:00 PM → AI Analysis (late games)
```

### Cost Estimates

**Daily:**
- Stats API: ~300 requests (within 500/day limit)
- Claude API: ~600-1200 requests (6 runs × 100-200 props)
- Estimated cost: ~$30-80/day for Claude API

**Monthly:**
- Stats API: $15-30/month
- Claude API: ~$900-2400/month
- **Total: ~$915-2430/month**

---

## 9. Testing Strategy

### 1. Unit Tests
- Hit rate calculations (edge cases)
- Confidence scoring algorithm
- Prop filtering/sorting logic
- Cache expiration logic

### 2. Integration Tests
- Full analysis pipeline (stats → hit rates → AI → DB)
- Catch of Day generation
- Personalized recommendations
- Error handling with retries

### 3. API Tests
- All API endpoints
- Authentication/authorization
- Error responses (400, 401, 404, 500)
- Response format validation

### 4. Manual Testing Checklist

**Before production:**
- [ ] Stats API credentials work
- [ ] Fetch stats for all sports
- [ ] Claude API key works
- [ ] Hit rates match manual calculations
- [ ] Confidence scoring accurate
- [ ] Catch of day generates correctly
- [ ] All API endpoints work
- [ ] Cron jobs trigger successfully
- [ ] Performance targets met (<5s per prop)

### 5. Load Testing
- Concurrent prop analysis requests
- Catch-of-day endpoint under load
- Monitor response times, error rates

### 6. Monitoring & Observability

**Key Metrics:**
- AI analysis success rate (target: >95%)
- Average analysis time (target: <3 seconds)
- Claude API error rate (target: <5%)
- Stats API quota usage (target: <80%)
- Catch of Day success (target: 100%)
- Cache hit rate (target: >70%)

---

## 10. Implementation Priority

### Phase 1: Foundation (Week 1)
1. Set up Stats API client
2. Create `player_season_stats` table
3. Build `stats-fetcher.ts` service
4. Test stats sync

### Phase 2: Hit Rates (Week 1-2)
1. Build `hit-rate-calculator.ts`
2. Calculate all 5 hit rate types
3. Update `PlayerProp` records
4. Test accuracy

### Phase 3: AI Analysis (Week 2)
1. Set up Claude API client
2. Build `prop-analyzer.ts`
3. Design and test prompts
4. Implement structured JSON parsing

### Phase 4: Confidence & Catch (Week 3)
1. Build `confidence-scorer.ts`
2. Build `catch-generator.ts`
3. Test scoring algorithms
4. Verify catch selection

### Phase 5: API & Cron (Week 3-4)
1. Create all API endpoints
2. Set up Vercel Cron jobs
3. Build `scheduler.ts` orchestration
4. End-to-end testing

### Phase 6: Personalization & Polish (Week 4)
1. Build `user-recommender.ts`
2. Add personalization logic
3. Performance optimization
4. Production deployment

---

## Appendix: Alternatives Considered

### Alternative Approach 2: Monolithic AI Service
- Single `AIEngine` class with all AI logic
- Easier coordination but harder to maintain
- **Rejected:** Doesn't match existing architecture pattern

### Alternative Approach 3: Event-Driven Architecture
- AI analysis triggered by events (new props, line movements)
- More responsive but more complex
- **Rejected:** Over-engineered for initial version, can evolve later

### Alternative Stats API: SportsData.io
- Similar features, slightly pricier ($25-50/month)
- **Rejected:** API-SPORTS better value for multi-sport coverage

---

## Summary

This AI Layer design provides production-grade sports betting prop analysis using:
- **Comprehensive stats** from API-SPORTS (last 5/10/25 games, season, vs opponent)
- **AI-powered analysis** from Claude API (structured, multi-angle insights)
- **Multi-signal confidence** scoring (stats + AI + market data)
- **Daily featured picks** with intelligent selection algorithms
- **Personalized recommendations** for individual users
- **Continuous refresh** every 3 hours to keep analysis current

The service-based architecture matches existing patterns, making it maintainable and scalable. Error handling ensures resilience, and comprehensive testing validates functionality before production deployment.

**Next Steps:** Proceed to implementation planning using the `writing-plans` skill.
