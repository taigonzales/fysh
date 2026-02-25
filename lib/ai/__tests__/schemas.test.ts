import { describe, it, expect } from '@jest/globals';
import {
  PropAnalysisSchema,
  CatchOfTheDaySchema,
  GamePreviewSchema,
  ParlayEvaluationSchema,
} from '../schemas';

describe('AI Schemas', () => {
  describe('PropAnalysisSchema', () => {
    it('should validate valid prop analysis', () => {
      const valid = {
        verdict: 'OVER',
        confidence: 'HIGH',
        summary: 'LeBron has been on fire lately',
        analysis: 'Detailed analysis here...',
        key_factors: ['Hot streak', 'Favorable matchup'],
        risk_factors: ['Back-to-back game'],
        edge_estimate: '5.2%',
      };

      const result = PropAnalysisSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.verdict).toBe('OVER');
        expect(result.data.confidence).toBe('HIGH');
      }
    });

    it('should reject invalid verdict', () => {
      const invalid = {
        verdict: 'MAYBE',
        confidence: 'HIGH',
        summary: 'Test',
        analysis: 'Test',
        key_factors: [],
        risk_factors: [],
        edge_estimate: '5%',
      };

      const result = PropAnalysisSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid confidence level', () => {
      const invalid = {
        verdict: 'OVER',
        confidence: 'ULTRA_HIGH',
        summary: 'Test',
        analysis: 'Test',
        key_factors: [],
        risk_factors: [],
        edge_estimate: '5%',
      };

      const result = PropAnalysisSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty summary', () => {
      const invalid = {
        verdict: 'OVER',
        confidence: 'HIGH',
        summary: '',
        analysis: 'Test',
        key_factors: [],
        risk_factors: [],
        edge_estimate: '5%',
      };

      const result = PropAnalysisSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should allow all valid verdict values', () => {
      ['OVER', 'UNDER', 'SKIP'].forEach((verdict) => {
        const data = {
          verdict,
          confidence: 'MEDIUM',
          summary: 'Test',
          analysis: 'Test',
          key_factors: [],
          risk_factors: [],
          edge_estimate: '3%',
        };
        const result = PropAnalysisSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should allow all valid confidence levels', () => {
      ['LOW', 'MEDIUM', 'HIGH', 'LOCK'].forEach((confidence) => {
        const data = {
          verdict: 'OVER',
          confidence,
          summary: 'Test',
          analysis: 'Test',
          key_factors: [],
          risk_factors: [],
          edge_estimate: '3%',
        };
        const result = PropAnalysisSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('CatchOfTheDaySchema', () => {
    it('should validate valid catch of the day', () => {
      const valid = {
        propId: 'prop-123',
        playerName: 'LeBron James',
        market: 'Points',
        line: 25.5,
        verdict: 'OVER',
        confidence: 'HIGH',
        headline: 'LeBron James OVER 25.5 Points - Red Hot Form',
        summary: 'LeBron has exceeded this line in 8 of his last 10 games',
        key_factors: [
          'Averaging 28.5 PPG over last 5 games',
          'Facing 28th-ranked defense',
        ],
        edge_estimate: '12.5%',
        value_score: 85,
      };

      const result = CatchOfTheDaySchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.playerName).toBe('LeBron James');
        expect(result.data.value_score).toBe(85);
      }
    });

    it('should reject invalid verdict for catch of the day', () => {
      const invalid = {
        propId: 'prop-123',
        playerName: 'LeBron James',
        market: 'Points',
        line: 25.5,
        verdict: 'SKIP', // Should only be OVER or UNDER for featured picks
        confidence: 'HIGH',
        headline: 'Test',
        summary: 'Test',
        key_factors: ['Test'],
        edge_estimate: '5%',
        value_score: 80,
      };

      const result = CatchOfTheDaySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject confidence levels below HIGH', () => {
      const invalid = {
        propId: 'prop-123',
        playerName: 'LeBron James',
        market: 'Points',
        line: 25.5,
        verdict: 'OVER',
        confidence: 'MEDIUM', // Catch of Day should only be HIGH or LOCK
        headline: 'Test',
        summary: 'Test',
        key_factors: ['Test'],
        edge_estimate: '5%',
        value_score: 80,
      };

      const result = CatchOfTheDaySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject value_score outside 0-100 range', () => {
      const invalid = {
        propId: 'prop-123',
        playerName: 'LeBron James',
        market: 'Points',
        line: 25.5,
        verdict: 'OVER',
        confidence: 'HIGH',
        headline: 'Test',
        summary: 'Test',
        key_factors: ['Test'],
        edge_estimate: '5%',
        value_score: 150, // Invalid - should be 0-100
      };

      const result = CatchOfTheDaySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('GamePreviewSchema', () => {
    it('should validate valid game preview', () => {
      const valid = {
        gameId: 'game-123',
        headline: 'Lakers vs Warriors: Western Conference Showdown',
        summary: 'Two playoff contenders meet in a crucial matchup',
        key_storylines: [
          'LeBron vs Curry - Battle of legends',
          'Lakers on 5-game win streak',
        ],
        injury_impact: 'Warriors missing Wiggins (personal)',
        betting_angles: [
          {
            market: 'Total Points',
            angle: 'Over looks good - both teams in top 10 for pace',
            confidence: 'MEDIUM',
          },
          {
            market: 'Spread',
            angle: 'Lakers cover at home (12-6 ATS)',
            confidence: 'HIGH',
          },
        ],
        value_plays: ['Lakers -3.5', 'Over 228.5'],
      };

      const result = GamePreviewSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gameId).toBe('game-123');
        expect(result.data.betting_angles).toHaveLength(2);
      }
    });

    it('should reject preview with empty key_storylines', () => {
      const invalid = {
        gameId: 'game-123',
        headline: 'Test Game',
        summary: 'Test summary',
        key_storylines: [], // Should have at least 1
        injury_impact: 'None',
        betting_angles: [],
        value_plays: [],
      };

      const result = GamePreviewSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate betting angles with all confidence levels', () => {
      ['LOW', 'MEDIUM', 'HIGH'].forEach((confidence) => {
        const data = {
          gameId: 'game-123',
          headline: 'Test',
          summary: 'Test',
          key_storylines: ['Storyline 1'],
          injury_impact: 'None',
          betting_angles: [
            {
              market: 'Test Market',
              angle: 'Test angle',
              confidence,
            },
          ],
          value_plays: [],
        };
        const result = GamePreviewSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('ParlayEvaluationSchema', () => {
    it('should validate valid parlay evaluation', () => {
      const valid = {
        overall_grade: 'B',
        confidence: 'MEDIUM',
        summary: 'Solid parlay with moderate correlation risk',
        correlation_risks: [
          {
            legs: [0, 1],
            risk: 'Both props from same game - if team blows out, both may hit',
            severity: 'MEDIUM',
          },
        ],
        independent_analysis: [
          {
            legIndex: 0,
            verdict: 'STRONG',
            reasoning: 'Player in excellent form, favorable matchup',
          },
          {
            legIndex: 1,
            verdict: 'GOOD',
            reasoning: 'Solid play, slight injury concern',
          },
        ],
        recommendation: 'PROCEED',
        suggested_improvements: ['Consider removing leg 2 for better odds'],
      };

      const result = ParlayEvaluationSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.overall_grade).toBe('B');
        expect(result.data.correlation_risks).toHaveLength(1);
      }
    });

    it('should reject invalid overall_grade', () => {
      const invalid = {
        overall_grade: 'Z', // Should be A-F
        confidence: 'MEDIUM',
        summary: 'Test',
        correlation_risks: [],
        independent_analysis: [],
        recommendation: 'PROCEED',
      };

      const result = ParlayEvaluationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid recommendation', () => {
      const invalid = {
        overall_grade: 'A',
        confidence: 'HIGH',
        summary: 'Test',
        correlation_risks: [],
        independent_analysis: [],
        recommendation: 'MAYBE', // Should be BUILD, PROCEED, RECONSIDER, or AVOID
      };

      const result = ParlayEvaluationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should allow all valid leg verdicts', () => {
      ['STRONG', 'GOOD', 'WEAK', 'AVOID'].forEach((verdict) => {
        const data = {
          overall_grade: 'B',
          confidence: 'MEDIUM',
          summary: 'Test',
          correlation_risks: [],
          independent_analysis: [
            {
              legIndex: 0,
              verdict,
              reasoning: 'Test reasoning',
            },
          ],
          recommendation: 'PROCEED',
        };
        const result = ParlayEvaluationSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should allow optional suggested_improvements', () => {
      const withoutImprovements = {
        overall_grade: 'A',
        confidence: 'HIGH',
        summary: 'Perfect parlay',
        correlation_risks: [],
        independent_analysis: [],
        recommendation: 'BUILD',
      };

      const result = ParlayEvaluationSchema.safeParse(withoutImprovements);
      expect(result.success).toBe(true);
    });

    it('should allow all valid correlation risk severities', () => {
      ['LOW', 'MEDIUM', 'HIGH'].forEach((severity) => {
        const data = {
          overall_grade: 'B',
          confidence: 'MEDIUM',
          summary: 'Test',
          correlation_risks: [
            {
              legs: [0, 1],
              risk: 'Test risk',
              severity,
            },
          ],
          independent_analysis: [],
          recommendation: 'PROCEED',
        };
        const result = ParlayEvaluationSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });
});
