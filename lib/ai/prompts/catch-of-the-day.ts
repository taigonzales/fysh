/**
 * Prompt builder for "Catch of the Day" selection
 */

export interface CatchCandidateProp {
  id: string;
  playerName: string;
  propType: string;
  line: number;
  team: string;
  opponent: string;
  hitRate: number;
  edge: number;
}

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
}

export function buildCatchOfTheDayPrompt(
  props: CatchCandidateProp[]
): PromptResult {
  const systemPrompt = `You are selecting the "Catch of the Day" - the single best player prop bet for today.

This is a premium featured pick that must meet HIGH standards:
- Only HIGH or LOCK confidence picks qualify
- Must have strong statistical edge and recent form
- Should be a compelling, easy-to-understand play

Analyze the candidate props and select the BEST one. Return your selection as a JSON object:

{
  "propId": "string",
  "playerName": "string",
  "market": "string",
  "line": number,
  "verdict": "OVER" | "UNDER",
  "confidence": "HIGH" | "LOCK",
  "headline": "Compelling headline (50-80 characters)",
  "summary": "Detailed summary explaining why this is the top pick (150-250 words)",
  "key_factors": ["Factor 1", "Factor 2", "Factor 3"],
  "edge_estimate": "X.X%",
  "value_score": 0-100 (integer representing overall value)
}

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.`;

  let userPrompt: string;

  if (props.length === 0) {
    userPrompt = `No props available for selection today.

Please return a JSON response indicating no picks are available.`;
  } else {
    userPrompt = `Select the best "Catch of the Day" from these ${props.length} candidate props:

${props
  .map(
    (prop, i) => `**Candidate ${i + 1}:**
- ID: ${prop.id}
- Player: ${prop.playerName} (${prop.team})
- Market: ${prop.propType}
- Line: ${prop.line}
- Opponent: ${prop.opponent}
- Hit Rate: ${(prop.hitRate * 100).toFixed(0)}%
- Estimated Edge: ${(prop.edge * 100).toFixed(1)}%
`
  )
  .join('\n')}

Analyze all candidates and select the single best prop as today's featured pick. Consider:
1. Statistical strength (hit rate consistency)
2. Betting value (estimated edge)
3. Narrative appeal (is this a compelling story?)
4. Confidence level (must be HIGH or LOCK)

Return your selection in the specified JSON format.`;
  }

  return {
    systemPrompt,
    userPrompt,
  };
}
