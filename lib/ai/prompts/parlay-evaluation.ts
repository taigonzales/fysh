/**
 * Prompt builder for parlay evaluation
 */

export interface ParlayLeg {
  playerName: string;
  propType: string;
  line: number;
  verdict: 'OVER' | 'UNDER';
  team: string;
  game: string;
  hitRate: number;
}

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
}

export function buildParlayEvaluationPrompt(legs: ParlayLeg[]): PromptResult {
  const systemPrompt = `You are a parlay evaluation expert specializing in correlation risk analysis.

Evaluate the provided parlay bet for quality, correlation risks, and overall value. Return as a JSON object:

{
  "overall_grade": "A" | "B" | "C" | "D" | "F",
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "summary": "Overall assessment of the parlay quality",
  "correlation_risks": [
    {
      "legs": [0, 1],  // Indices of correlated legs
      "risk": "Description of the correlation",
      "severity": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "independent_analysis": [
    {
      "legIndex": 0,
      "verdict": "STRONG" | "GOOD" | "WEAK" | "AVOID",
      "reasoning": "Why this leg is strong/weak"
    }
  ],
  "recommendation": "BUILD" | "PROCEED" | "RECONSIDER" | "AVOID",
  "suggested_improvements": ["Suggestion 1", "Suggestion 2"] (optional)
}

Key considerations:
- Same-game parlays have HIGH correlation risk
- Same-team props have MEDIUM correlation risk
- Completely independent games have LOW correlation risk
- Grade should reflect overall parlay quality (A=excellent, F=avoid)

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.`;

  // Group legs by game to identify correlation
  const gameGroups = new Map<string, number[]>();
  legs.forEach((leg, index) => {
    const existing = gameGroups.get(leg.game) || [];
    existing.push(index);
    gameGroups.set(leg.game, existing);
  });

  const correlationNote =
    legs.length > 1
      ? Array.from(gameGroups.entries())
          .filter(([_, indices]) => indices.length > 1)
          .map(
            ([game, indices]) =>
              `⚠️ Correlation Alert: Legs ${indices.map((i) => i + 1).join(', ')} are all from ${game}`
          )
          .join('\n')
      : '';

  const userPrompt = `Evaluate this ${legs.length}-leg parlay:

${legs
  .map(
    (leg, i) => `**Leg ${i + 1}:**
- Player: ${leg.playerName} (${leg.team})
- Market: ${leg.propType}
- Line: ${leg.line} ${leg.verdict}
- Game: ${leg.game}
- Historical Hit Rate: ${(leg.hitRate * 100).toFixed(0)}%
`
  )
  .join('\n')}

${correlationNote ? `\n${correlationNote}\n` : ''}

Analyze this parlay for:
1. **Individual Leg Quality:** How strong is each pick on its own?
2. **Correlation Risks:** Do any legs influence each other's outcomes?
3. **Overall Grade:** What's the parlay quality grade (A-F)?
4. **Recommendation:** Should the bettor BUILD, PROCEED, RECONSIDER, or AVOID?
5. **Improvements:** Any suggestions to strengthen the parlay?

${
  legs.length === 1
    ? `Note: This is a single-leg "parlay" (straight bet). Evaluate it as a standalone play.`
    : ''
}

Return your evaluation in the specified JSON format.`;

  return {
    systemPrompt,
    userPrompt,
  };
}
