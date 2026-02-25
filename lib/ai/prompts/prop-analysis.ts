/**
 * Prompt builder for individual prop analysis
 */

export interface PropAnalysisContext {
  playerName: string;
  propType: string;
  line: number;
  team: string;
  opponent: string;
  gameTime: string;
  hitRates: {
    last5: number;
    last10: number;
    last25: number;
    season: number;
    vsOpponent: number | null;
  };
  recentGames: number[];
  seasonAvg: number;
}

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
}

export function buildPropAnalysisPrompt(
  context: PropAnalysisContext
): PromptResult {
  const {
    playerName,
    propType,
    line,
    team,
    opponent,
    hitRates,
    recentGames,
    seasonAvg,
  } = context;

  // Calculate hit counts from rates
  const last5Hits = Math.round(hitRates.last5 * 5);
  const last10Hits = Math.round(hitRates.last10 * 10);
  const last25Hits = Math.round(hitRates.last25 * 25);

  const systemPrompt = `You are a professional sports betting analyst specializing in player prop analysis.

Analyze the provided player prop and return your recommendation as a JSON object with the following structure:

{
  "verdict": "OVER" | "UNDER" | "SKIP",
  "confidence": "LOW" | "MEDIUM" | "HIGH" | "LOCK",
  "summary": "Brief 1-2 sentence summary of your recommendation",
  "analysis": "Detailed analysis covering form, matchup, and betting value",
  "key_factors": ["Factor 1", "Factor 2", "Factor 3"],
  "risk_factors": ["Risk 1", "Risk 2"],
  "edge_estimate": "X.X%"
}

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.`;

  const userPrompt = `Analyze this player prop:

**Player:** ${playerName} (${team})
**Market:** ${propType}
**Line:** ${line} (Over/Under)
**Opponent:** ${opponent}

**Hit Rate Analysis:**
- Last 5 games: ${last5Hits} of 5 (${(hitRates.last5 * 100).toFixed(0)}%)
- Last 10 games: ${last10Hits} of 10 (${(hitRates.last10 * 100).toFixed(0)}%)
- Last 25 games: ${last25Hits} of 25 (${(hitRates.last25 * 100).toFixed(0)}%)
- Season: ${(hitRates.season * 100).toFixed(0)}%${
    hitRates.vsOpponent !== null
      ? `\n- vs ${opponent}: ${(hitRates.vsOpponent * 100).toFixed(0)}%`
      : ''
  }

**Recent Performance (Last 5 Games):**
${recentGames.map((stat, i) => `Game ${i + 1}: ${stat}`).join('\n')}

**Season Average:** ${seasonAvg}

Provide your analysis and recommendation in the specified JSON format.`;

  return {
    systemPrompt,
    userPrompt,
  };
}
