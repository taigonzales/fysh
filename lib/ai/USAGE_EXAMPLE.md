# AI Layer Usage Examples

## Overview

The AI layer provides type-safe Claude API integration for sports betting analysis:

1. **Prompt Builders** - Generate system/user prompts for different analysis types
2. **Zod Schemas** - Validate Claude's JSON responses
3. **Claude Client** - Wrapper for Anthropic SDK with structured output support

## Complete Flow Example

### 1. Prop Analysis

```typescript
import { ClaudeClient } from './claude-client';
import { buildPropAnalysisPrompt } from './prompts';
import { PropAnalysisSchema } from './schemas';

// Create client
const client = new ClaudeClient();

// Build prompts
const { systemPrompt, userPrompt } = buildPropAnalysisPrompt({
  playerName: 'LeBron James',
  propType: 'Points',
  line: 25.5,
  team: 'Lakers',
  opponent: 'Warriors',
  gameTime: '2024-01-15T19:00:00Z',
  hitRates: {
    last5: 0.8,   // 4 of 5 games
    last10: 0.7,  // 7 of 10 games
    last25: 0.68, // 17 of 25 games
    season: 0.65,
    vsOpponent: 0.75,
  },
  recentGames: [28, 32, 24, 30, 27],
  seasonAvg: 26.8,
});

// Get validated analysis
const analysis = await client.analyzeStructured(
  systemPrompt,
  userPrompt,
  PropAnalysisSchema
);

// TypeScript knows the exact type!
console.log(analysis.verdict);     // 'OVER' | 'UNDER' | 'SKIP'
console.log(analysis.confidence);  // 'LOW' | 'MEDIUM' | 'HIGH' | 'LOCK'
console.log(analysis.summary);     // string
console.log(analysis.analysis);    // string
console.log(analysis.key_factors); // string[]
```

### 2. Catch of the Day

```typescript
import { buildCatchOfTheDayPrompt } from './prompts';
import { CatchOfTheDaySchema } from './schemas';

const { systemPrompt, userPrompt } = buildCatchOfTheDayPrompt([
  {
    id: 'prop-1',
    playerName: 'LeBron James',
    propType: 'Points',
    line: 25.5,
    team: 'Lakers',
    opponent: 'Warriors',
    hitRate: 0.8,
    edge: 0.12,
  },
  {
    id: 'prop-2',
    playerName: 'Steph Curry',
    propType: 'Threes',
    line: 4.5,
    team: 'Warriors',
    opponent: 'Lakers',
    hitRate: 0.75,
    edge: 0.08,
  },
]);

const catchOfTheDay = await client.analyzeStructured(
  systemPrompt,
  userPrompt,
  CatchOfTheDaySchema
);

// Only HIGH or LOCK confidence
console.log(catchOfTheDay.confidence); // 'HIGH' | 'LOCK'
console.log(catchOfTheDay.headline);
console.log(catchOfTheDay.value_score); // 0-100
```

### 3. Game Preview

```typescript
import { buildGamePreviewPrompt } from './prompts';
import { GamePreviewSchema } from './schemas';

const { systemPrompt, userPrompt } = buildGamePreviewPrompt({
  gameId: 'game-123',
  homeTeam: 'Lakers',
  awayTeam: 'Warriors',
  gameTime: '2024-01-15T19:00:00Z',
  venue: 'Crypto.com Arena',
  homeRecord: '25-15',
  awayRecord: '22-18',
  injuries: [
    { team: 'Warriors', player: 'Andrew Wiggins', status: 'Out' },
  ],
  trends: {
    homeTeamLast10: '7-3',
    awayTeamLast10: '5-5',
    headToHead: 'Lakers lead 2-1',
  },
});

const preview = await client.analyzeStructured(
  systemPrompt,
  userPrompt,
  GamePreviewSchema
);

// Betting angles with confidence
preview.betting_angles.forEach((angle) => {
  console.log(`${angle.market}: ${angle.angle} [${angle.confidence}]`);
});
```

### 4. Parlay Evaluation

```typescript
import { buildParlayEvaluationPrompt } from './prompts';
import { ParlayEvaluationSchema } from './schemas';

const { systemPrompt, userPrompt } = buildParlayEvaluationPrompt([
  {
    playerName: 'LeBron James',
    propType: 'Points',
    line: 25.5,
    verdict: 'OVER',
    team: 'Lakers',
    game: 'Lakers vs Warriors',
    hitRate: 0.8,
  },
  {
    playerName: 'Anthony Davis',
    propType: 'Rebounds',
    line: 11.5,
    verdict: 'OVER',
    team: 'Lakers',
    game: 'Lakers vs Warriors',
    hitRate: 0.75,
  },
]);

const evaluation = await client.analyzeStructured(
  systemPrompt,
  userPrompt,
  ParlayEvaluationSchema
);

console.log(evaluation.overall_grade);    // 'A' | 'B' | 'C' | 'D' | 'F'
console.log(evaluation.recommendation);   // 'BUILD' | 'PROCEED' | 'RECONSIDER' | 'AVOID'

// Check correlation risks
evaluation.correlation_risks.forEach((risk) => {
  console.log(`⚠️ Legs ${risk.legs.join(', ')}: ${risk.risk} [${risk.severity}]`);
});
```

## Error Handling

```typescript
try {
  const analysis = await client.analyzeStructured(
    systemPrompt,
    userPrompt,
    PropAnalysisSchema
  );
} catch (error) {
  if (error.message.includes('authentication_error')) {
    console.error('Invalid API key');
  } else if (error.message.includes('Failed to parse')) {
    console.error('Claude returned invalid JSON');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Type Safety

All responses are fully typed:

```typescript
// TypeScript knows the exact shape
type PropAnalysis = {
  verdict: 'OVER' | 'UNDER' | 'SKIP';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'LOCK';
  summary: string;
  analysis: string;
  key_factors: string[];
  risk_factors: string[];
  edge_estimate: string;
};

// Invalid values are caught at runtime
const invalid = {
  verdict: 'MAYBE', // ❌ Not in enum
  confidence: 'ULTRA_HIGH', // ❌ Not in enum
};

PropAnalysisSchema.parse(invalid); // Throws ZodError
```

## Testing

```typescript
import { buildPropAnalysisPrompt } from './prompts';

// Prompts are pure functions - easy to test
const result = buildPropAnalysisPrompt({ /* ... */ });

expect(result.systemPrompt).toContain('betting analyst');
expect(result.userPrompt).toContain('LeBron James');
```

## Best Practices

1. **Always use schemas** - Never parse JSON manually
2. **Handle errors** - API calls can fail, schemas can reject invalid data
3. **Test prompts** - Verify prompts contain expected data
4. **Monitor costs** - Each `analyzeStructured` call costs tokens
5. **Cache responses** - Don't re-analyze the same prop multiple times

## Next Steps

See `lib/services/ai/` for service-layer implementations that use these primitives to build complete analysis workflows.
