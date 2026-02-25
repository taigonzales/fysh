# AI Services Design Document

**Date:** 2026-02-24
**Author:** Claude Sonnet 4.5
**Status:** Approved - Ready for Implementation

---

## Overview

Implementation of three additional AI services for FYSH platform:
1. **Catch of the Day Generator** - Daily featured prop pick based on weighted scoring
2. **Game Preview Generator** - Pre-game analysis with betting angles
3. **Parlay Evaluator** - Correlation risk analysis and quality grading

---

## Requirements Summary

### Catch of the Day
- **Selection Criteria:** Props with highest betting volume (measured by line movement + book count)
- **Scoring:** Weighted combination of AI confidence (40%), edge (35%), line movement (15%), book count (10%)
- **Quality Bar:** Only HIGH/LOCK confidence props qualify
- **Schedule:** Generated daily at 9:00 AM EST
- **Storage:** Saved to `AiInsight` table with 24-hour expiry

### Game Preview
- **Trigger:** Automated daily generation for all scheduled games
- **Data Sources:** Free APIs (ESPN, Basketball-Reference for stats/injuries/H2H)
- **Content:** Headline, summary, key storylines, injury impact, betting angles, value plays
- **Schedule:** Generated at 9:00 AM EST (before games start)
- **Storage:** Saved to `AiInsight` table, expires at game start time

### Parlay Evaluator
- **Input:** Both saved parlays (from `TrackedBet`) and ad-hoc leg arrays
- **Analysis:** Correlation risk detection, individual leg quality, overall grade (A-F)
- **Output:** Grade, confidence, recommendation (BUILD/PROCEED/RECONSIDER/AVOID), suggested improvements
- **Trigger:** On-demand via API endpoint
- **Storage:** Not saved (on-demand only)

---

## Architecture

### Service-Per-Feature Pattern

Following existing `prop-analyzer.ts` pattern for consistency:

```
lib/
├── api/
│   └── free-stats/                    (NEW)
│       ├── types.ts
│       ├── constants.ts
│       ├── client.ts
│       └── index.ts
│
├── services/ai/
│   ├── prop-analyzer.ts               (✅ exists)
│   ├── catch-of-day-generator.ts      (NEW)
│   ├── game-preview-generator.ts      (NEW)
│   ├── parlay-evaluator.ts            (NEW)
│   ├── line-movement.ts               (NEW - helper)
│   └── scoring/                       (NEW)
│       ├── catch-scorer.ts
│       └── types.ts
│
└── ai/
    ├── prompts/                        (✅ exists - already have all prompts)
    ├── schemas.ts                      (✅ exists - already validated)
    └── claude-client.ts                (✅ exists)
```

---

## Database Changes

### Schema Updates

```prisma
model PlayerProp {
  // Existing fields...

  // NEW: Line tracking (calculated from our odds data)
  lineMovement      Float?    @map("line_movement")      // Change from opening
  bookCount         Int?      @map("book_count")         // # of books offering
  consensusValue    Float?    @map("consensus_value")    // Avg line across books
  lastCalculated    DateTime? @map("last_calculated")
}

enum InsightType {
  CATCH_OF_DAY
  PROP_ANALYSIS
  GAME_PREVIEW
  PARLAY_EVAL      // NEW
}
```

### Migration Strategy

1. Add new fields to `PlayerProp` model
2. Run `pnpm db:push` to apply schema changes
3. Backfill existing props with `null` values (calculated on-demand)

---

## Component Details

### 1. Catch of Day Generator

**File:** `lib/services/ai/catch-of-day-generator.ts`

**Flow:**
1. Query all props for target date with existing AI analysis
2. Filter to HIGH/LOCK confidence only
3. Calculate weighted score for each candidate
4. Select top-scoring prop
5. Generate detailed analysis with Claude
6. Save to `AiInsight` table

**Scoring Algorithm:**
```typescript
score = (0.40 × confidence_score) +
        (0.35 × edge_score) +
        (0.15 × line_movement_score) +
        (0.10 × book_count_score)
```

**Key Functions:**
- `generateCatchOfDay(date?: Date): Promise<CatchOfDayResult>`
- `getCatchOfDay(date?: Date): Promise<CatchOfDayResult | null>` (retrieve saved)

### 2. Game Preview Generator

**File:** `lib/services/ai/game-preview-generator.ts`

**Flow:**
1. Query all scheduled games for target date
2. For each game:
   - Fetch team stats from ESPN API (free)
   - Fetch injuries from ESPN
   - Get head-to-head history
3. Build preview prompt with context
4. Generate analysis with Claude
5. Save to `AiInsight` table

**Data Sources (All Free):**
- ESPN public API: Team records, stats
- ESPN web scraping: Injury reports
- Basketball-Reference: Historical H2H data

**Key Functions:**
- `generateGamePreviews(date?: Date): Promise<GamePreviewResult[]>`
- `generateGamePreview(gameId: string): Promise<GamePreviewResult>`
- `getGamePreview(gameId: string): Promise<GamePreviewResult | null>` (retrieve saved)

### 3. Parlay Evaluator

**File:** `lib/services/ai/parlay-evaluator.ts`

**Flow:**
1. Accept parlay legs (array of props with verdicts)
2. Enrich with hit rate data from database
3. Detect correlation risks (same-game, same-team)
4. Build evaluation prompt
5. Generate analysis with Claude
6. Return results (no database save)

**Correlation Detection:**
- Same game = HIGH risk
- Same team = MEDIUM risk
- Different games = LOW risk

**Key Functions:**
- `evaluateParlay(legs: ParlayLegInput[]): Promise<ParlayEvaluationResult>`
- `evaluateSavedParlay(parlayId: string): Promise<ParlayEvaluationResult>`

### 4. Line Movement Calculator

**File:** `lib/services/ai/line-movement.ts`

**Purpose:** Calculate how much lines have moved (sharp money indicator)

**Functions:**
- `calculateLineMovement(propId: string): Promise<number>`
- `calculateBookCount(propId: string): Promise<number>`
- `syncLineMovement(date?: Date): Promise<SyncResult>`

**Note:** Requires tracking odds over time. Initial version returns simple calculations.

### 5. Catch Scorer

**File:** `lib/services/ai/scoring/catch-scorer.ts`

**Purpose:** Weighted scoring algorithm for catch selection

**Functions:**
- `calculateCatchScore(candidate: CatchCandidate): number` (returns 0-100)
- `normalizeCandidates(candidates: CatchCandidate[]): ScoredCandidate[]`

### 6. Free Stats Client

**File:** `lib/api/free-stats/client.ts`

**Purpose:** Fetch team stats and injury data from free sources

**Functions:**
- `getTeamRecord(team: string, sport: Sport): Promise<string>`
- `getTeamStats(team: string, sport: Sport): Promise<TeamStats>`
- `getInjuries(gameId: string): Promise<Injury[]>`
- `getHeadToHead(team1: string, team2: string): Promise<string>`

**Data Sources:**
- `site.api.espn.com` - Team records, stats
- `espn.com` - Injury reports (web scraping)
- `basketball-reference.com` - H2H history

---

## API Endpoints

### New Routes

```
POST /api/ai/catch-of-day/generate
  - Generate catch for specified date (default: today)
  - Body: { date?: string }
  - Returns: CatchOfDayResult

GET /api/ai/catch-of-day
  - Get latest catch (or for specific date)
  - Query: ?date=2024-01-15
  - Returns: CatchOfDayResult | null

POST /api/ai/game-previews/generate
  - Generate previews for all games on date
  - Body: { date?: string }
  - Returns: GamePreviewResult[]

GET /api/ai/game-previews/:gameId
  - Get preview for specific game
  - Returns: GamePreviewResult | null

POST /api/ai/parlay/evaluate
  - Evaluate a parlay
  - Body: { legs: ParlayLegInput[] }
  - Returns: ParlayEvaluationResult

POST /api/ai/parlay/:parlayId/evaluate
  - Evaluate saved parlay from TrackedBet
  - Returns: ParlayEvaluationResult
```

### Cron Endpoint

```
GET /api/cron/daily-ai-refresh
  - Runs daily automation
  - Auth: Bearer token (CRON_SECRET)
  - Steps:
    1. Sync line movement
    2. Analyze unanalyzed props
    3. Generate catch of day
    4. Generate game previews
  - Returns: Status of all operations
```

---

## Automation

### Daily Schedule (9:00 AM EST)

```
Daily Automation Pipeline:
├─ Step 1: Line Movement Sync (5 min)
│  └─ Calculate lineMovement, bookCount for today's props
│
├─ Step 2: Prop Analysis (30 min)
│  └─ Analyze only new/unanalyzed props
│
├─ Step 3: Catch of Day (2 min)
│  └─ Select and generate featured pick
│
└─ Step 4: Game Previews (10-20 min)
   └─ Generate preview for each game

Total Runtime: 45-60 minutes
```

### Vercel Cron Configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-ai-refresh",
      "schedule": "0 14 * * *"
    }
  ]
}
```

Alternative: GitHub Actions (free tier)

---

## Rate Limiting

### Claude API Budget

- **Daily Limit:** 100,000 tokens
- **Per Request Estimates:**
  - Prop analysis: 2,000 tokens
  - Catch of day: 3,000 tokens
  - Game preview: 2,500 tokens
  - Parlay eval: 1,500 tokens

### Rate Limiter Implementation

```typescript
class AiRateLimiter {
  private static dailyBudget = 100000;
  private static used = 0;
  private static resetAt = new Date();

  static async canUseTokens(estimated: number): Promise<boolean>
  static recordUsage(tokens: number): void
  static getRemainingBudget(): number
}
```

**Usage:** Check before each Claude API call, track after completion

---

## Error Handling

### Strategies

1. **Database Errors:** Retry with exponential backoff (max 3 attempts)
2. **API Rate Limits:** Queue jobs if quota exceeded
3. **Claude API Errors:** Log, alert, return graceful error
4. **Missing Data:** Skip item, continue processing others
5. **Partial Failures:** Return results for successful items + error summary

### Monitoring

- Console logging for development
- Email alerts via Resend (free tier: 100/day) for production
- Alert triggers:
  - Catch generation fails
  - >50% of game previews fail
  - Claude API quota exceeded

---

## Testing Plan

### Test Files

```
lib/services/ai/__tests__/
├── catch-of-day-generator.test.ts
├── game-preview-generator.test.ts
├── parlay-evaluator.test.ts
└── scoring/
    └── catch-scorer.test.ts

lib/api/free-stats/__tests__/
└── client.test.ts
```

### Coverage Goals

- **Unit Tests:** 100% coverage on scoring algorithms
- **Integration Tests:** All service flows with mocked Claude/DB
- **E2E Tests:** Full pipeline with test database

### Manual Testing Checklist

- [ ] Generate catch with 10+ qualifying props
- [ ] Generate catch with no qualifying props (should fail gracefully)
- [ ] Generate previews for 5+ games
- [ ] Evaluate 3-leg same-game parlay (high correlation)
- [ ] Evaluate 5-leg multi-game parlay (low correlation)
- [ ] Run full cron job (verify < 60 min runtime)
- [ ] Verify rate limits respected

---

## Performance Benchmarks

| Operation | Expected Time | Token Usage |
|-----------|--------------|-------------|
| Line Movement Sync | < 5 min | 0 |
| Prop Analysis (100 props) | < 30 min | 200,000 |
| Catch of Day | < 2 min | 3,000 |
| Game Previews (10 games) | < 20 min | 25,000 |
| Parlay Eval | < 1 min | 1,500 |

**Daily Token Budget Usage:**
- Typical day: ~30,000 tokens (10 previews + 1 catch)
- Heavy day: ~50,000 tokens (20 previews + 1 catch + re-analysis)
- Well within 100k limit

---

## Environment Variables

```bash
# .env.local (no new costs - all free)
ANTHROPIC_API_KEY=sk-ant-...    # ✅ Already have
DATABASE_URL=postgresql://...   # ✅ Already have
CRON_SECRET=...                 # NEW - for cron authentication
RESEND_API_KEY=...              # NEW - for email alerts (free tier)
```

---

## Trade-offs & Decisions

### Why No Paid Volume APIs?

**Decision:** Use line movement + book count as proxy for volume
**Reason:** Budget constraint ($0 additional spend)
**Trade-off:** Less accurate than real betting handle, but still effective
**Mitigation:** Can upgrade to paid API later without code changes (just swap client)

### Why Free Stats APIs?

**Decision:** ESPN public API + web scraping
**Reason:** $0 cost, sufficient data quality
**Trade-off:** Less reliable (scraping can break), no advanced metrics
**Mitigation:** Graceful fallbacks, can upgrade to API-SPORTS later

### Why Service-Per-Feature Pattern?

**Decision:** Separate files vs unified orchestrator
**Reason:** Matches existing codebase, easier to maintain
**Trade-off:** Some code duplication
**Mitigation:** Shared utilities in common files

---

## Success Criteria

### Launch Checklist

- [ ] All tests passing (unit + integration)
- [ ] Catch generates daily without failures
- [ ] Game previews complete within 20 min
- [ ] Parlay evaluator handles edge cases
- [ ] Rate limits respected (<100k tokens/day)
- [ ] Error alerts working
- [ ] Documentation complete

### KPIs to Track

- Daily catch generation success rate (target: >95%)
- Game preview generation time (target: <20 min)
- Claude API token usage (target: <50k/day avg)
- Parlay evaluation response time (target: <1 min)
- User engagement with catch/previews (after frontend built)

---

## Future Enhancements

1. **Paid Volume API:** Upgrade to Sports Insights for real betting handle
2. **Multi-Book Odds:** Track props across multiple sportsbooks
3. **Historical Tracking:** Store catch performance for accuracy analysis
4. **Auto-Build Parlays:** Proactively create optimized parlays
5. **Real-time Updates:** Refresh previews as injury news breaks
6. **Advanced Stats:** Integrate advanced metrics (offensive rating, pace, etc.)

---

## Implementation Plan

Proceed to detailed implementation plan using `writing-plans` skill.

**Next Steps:**
1. Break down into discrete tasks
2. Define task dependencies
3. Estimate time per task
4. Create implementation checklist
5. Begin execution in worktree

---

**Document Approved:** 2026-02-24
**Ready for Implementation:** ✅
