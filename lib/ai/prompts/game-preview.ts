/**
 * Prompt builder for game preview analysis
 */

export interface GamePreviewContext {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  venue: string;
  homeRecord: string;
  awayRecord: string;
  injuries: Array<{
    team: string;
    player: string;
    status: string;
  }>;
  trends: {
    homeTeamLast10: string;
    awayTeamLast10: string;
    headToHead: string;
  };
}

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
}

export function buildGamePreviewPrompt(
  context: GamePreviewContext
): PromptResult {
  const {
    gameId,
    homeTeam,
    awayTeam,
    venue,
    homeRecord,
    awayRecord,
    injuries,
    trends,
  } = context;

  const systemPrompt = `You are a sports analyst creating comprehensive pre-game previews with betting insights.

Analyze the upcoming game and provide a detailed preview with betting angles. Return as a JSON object:

{
  "gameId": "string",
  "headline": "Compelling headline for the game",
  "summary": "2-3 paragraph game overview",
  "key_storylines": ["Storyline 1", "Storyline 2", "Storyline 3+"],
  "injury_impact": "Analysis of how injuries affect the game",
  "betting_angles": [
    {
      "market": "Spread/Total/Moneyline/etc",
      "angle": "Specific betting insight",
      "confidence": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "value_plays": ["Specific bet recommendation 1", "Specific bet recommendation 2"]
}

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.`;

  const injuryReport =
    injuries.length > 0
      ? injuries
          .map((injury) => `- ${injury.team}: ${injury.player} (${injury.status})`)
          .join('\n')
      : '- No reported injuries';

  const userPrompt = `Create a comprehensive preview for this game:

**Matchup:** ${awayTeam} @ ${homeTeam}
**Venue:** ${venue}
**Records:** ${awayTeam} (${awayRecord}) vs ${homeTeam} (${homeRecord})

**Recent Form:**
- ${homeTeam}: ${trends.homeTeamLast10} in last 10 games
- ${awayTeam}: ${trends.awayTeamLast10} in last 10 games
- Head-to-Head: ${trends.headToHead}

**Injury Report:**
${injuryReport}

Provide a detailed preview with key storylines and betting angles. Focus on:
1. What makes this game interesting
2. Key player matchups
3. How injuries impact the game
4. Specific betting opportunities (spreads, totals, props)
5. Value plays where the line may be mispriced

Return your analysis in the specified JSON format.`;

  return {
    systemPrompt,
    userPrompt,
  };
}
