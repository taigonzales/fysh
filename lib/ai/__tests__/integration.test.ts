import { ClaudeClient } from '../claude-client';
import {
  PropAnalysisSchema,
  CatchOfTheDaySchema,
  GamePreviewSchema,
  ParlayEvaluationSchema,
} from '../schemas';

describe('AI Integration Tests', () => {
  let client: ClaudeClient;

  beforeAll(() => {
    client = new ClaudeClient();
  });

  describe('ClaudeClient + Schema Integration', () => {
    it('should analyze a prop and return validated PropAnalysis', async () => {
      const systemPrompt = `You are a professional sports betting analyst. Analyze player props and provide structured recommendations.

Respond ONLY with valid JSON matching this structure:
{
  "verdict": "OVER" | "UNDER" | "SKIP",
  "confidence": "LOW" | "MEDIUM" | "HIGH" | "LOCK",
  "summary": "Brief 1-2 sentence summary",
  "analysis": "Detailed analysis",
  "key_factors": ["Factor 1", "Factor 2"],
  "risk_factors": ["Risk 1", "Risk 2"],
  "edge_estimate": "X.X%"
}`;

      const userPrompt = `Analyze this player prop:
Player: LeBron James
Market: Points
Line: 25.5 (Over/Under)
Opponent: Golden State Warriors
Context: LeBron averaging 28.2 PPG over last 5 games, Warriors ranked 22nd in defensive rating`;

      const result = await client.analyzeStructured(
        systemPrompt,
        userPrompt,
        PropAnalysisSchema
      );

      // Verify result is properly typed and validated
      expect(result).toBeDefined();
      expect(['OVER', 'UNDER', 'SKIP']).toContain(result.verdict);
      expect(['LOW', 'MEDIUM', 'HIGH', 'LOCK']).toContain(result.confidence);
      expect(result.summary.length).toBeGreaterThan(0);
      expect(result.analysis.length).toBeGreaterThan(0);
      expect(Array.isArray(result.key_factors)).toBe(true);
      expect(Array.isArray(result.risk_factors)).toBe(true);
      expect(result.edge_estimate).toMatch(/%/);

      console.log('\n✅ PropAnalysis Integration Test:');
      console.log(JSON.stringify(result, null, 2));
    }, 30000); // 30 second timeout for API call

    it('should analyze and return validated CatchOfTheDay', async () => {
      const systemPrompt = `You are selecting the "Catch of the Day" - the single best player prop bet for today. Only HIGH or LOCK confidence picks qualify.

Respond ONLY with valid JSON matching this structure:
{
  "propId": "string",
  "playerName": "string",
  "market": "string",
  "line": number,
  "verdict": "OVER" | "UNDER",
  "confidence": "HIGH" | "LOCK",
  "headline": "Compelling headline",
  "summary": "Detailed summary",
  "key_factors": ["Factor 1", "Factor 2"],
  "edge_estimate": "X.X%",
  "value_score": 0-100
}`;

      const userPrompt = `Select the best prop from these options:
1. LeBron James OVER 25.5 Points vs Warriors (hit 8 of last 10)
2. Steph Curry OVER 4.5 Threes vs Lakers (hit 6 of last 10)
3. Anthony Davis OVER 11.5 Rebounds vs Warriors (hit 9 of last 10)`;

      const result = await client.analyzeStructured(
        systemPrompt,
        userPrompt,
        CatchOfTheDaySchema
      );

      // Verify result structure
      expect(result).toBeDefined();
      expect(result.propId).toBeDefined();
      expect(result.playerName.length).toBeGreaterThan(0);
      expect(['OVER', 'UNDER']).toContain(result.verdict);
      expect(['HIGH', 'LOCK']).toContain(result.confidence);
      expect(result.value_score).toBeGreaterThanOrEqual(0);
      expect(result.value_score).toBeLessThanOrEqual(100);

      console.log('\n✅ CatchOfTheDay Integration Test:');
      console.log(JSON.stringify(result, null, 2));
    }, 30000);

    it('should generate and return validated GamePreview', async () => {
      const systemPrompt = `You are a sports analyst creating pre-game previews with betting insights.

Respond ONLY with valid JSON matching this structure:
{
  "gameId": "string",
  "headline": "string",
  "summary": "string",
  "key_storylines": ["Storyline 1", "Storyline 2"],
  "injury_impact": "string",
  "betting_angles": [
    {
      "market": "string",
      "angle": "string",
      "confidence": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "value_plays": ["Play 1", "Play 2"]
}`;

      const userPrompt = `Create a preview for:
Game: Los Angeles Lakers vs Golden State Warriors
Time: Tonight 7:00 PM PT
Context: Lakers on 5-game win streak, Warriors struggling on road (8-12)
Injuries: Warriors missing Andrew Wiggins (personal)`;

      const result = await client.analyzeStructured(
        systemPrompt,
        userPrompt,
        GamePreviewSchema
      );

      // Verify result structure
      expect(result).toBeDefined();
      expect(result.gameId).toBeDefined();
      expect(result.key_storylines.length).toBeGreaterThan(0);
      expect(Array.isArray(result.betting_angles)).toBe(true);
      if (result.betting_angles.length > 0) {
        expect(['LOW', 'MEDIUM', 'HIGH']).toContain(
          result.betting_angles[0].confidence
        );
      }

      console.log('\n✅ GamePreview Integration Test:');
      console.log(JSON.stringify(result, null, 2));
    }, 30000);

    it('should evaluate and return validated ParlayEvaluation', async () => {
      const systemPrompt = `You are evaluating a parlay bet for quality and correlation risks.

Respond ONLY with valid JSON matching this structure:
{
  "overall_grade": "A" | "B" | "C" | "D" | "F",
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "summary": "string",
  "correlation_risks": [
    {
      "legs": [0, 1],
      "risk": "string",
      "severity": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "independent_analysis": [
    {
      "legIndex": 0,
      "verdict": "STRONG" | "GOOD" | "WEAK" | "AVOID",
      "reasoning": "string"
    }
  ],
  "recommendation": "BUILD" | "PROCEED" | "RECONSIDER" | "AVOID",
  "suggested_improvements": ["Improvement 1"]
}`;

      const userPrompt = `Evaluate this 3-leg parlay:
Leg 1: LeBron James OVER 25.5 Points vs Warriors
Leg 2: Anthony Davis OVER 11.5 Rebounds vs Warriors
Leg 3: Steph Curry OVER 4.5 Threes vs Lakers`;

      const result = await client.analyzeStructured(
        systemPrompt,
        userPrompt,
        ParlayEvaluationSchema
      );

      // Verify result structure
      expect(result).toBeDefined();
      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.overall_grade);
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.confidence);
      expect(['BUILD', 'PROCEED', 'RECONSIDER', 'AVOID']).toContain(
        result.recommendation
      );
      expect(Array.isArray(result.correlation_risks)).toBe(true);
      expect(Array.isArray(result.independent_analysis)).toBe(true);

      console.log('\n✅ ParlayEvaluation Integration Test:');
      console.log(JSON.stringify(result, null, 2));
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should throw error when Claude returns invalid JSON structure', async () => {
      const systemPrompt = 'Return an invalid response';
      const userPrompt = 'Test';

      await expect(
        client.analyzeStructured(systemPrompt, userPrompt, PropAnalysisSchema)
      ).rejects.toThrow();
    }, 30000);
  });
});
