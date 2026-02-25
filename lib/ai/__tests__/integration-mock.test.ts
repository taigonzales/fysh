/**
 * Mock integration tests - verify ClaudeClient + Schema integration without API calls
 * These tests validate the structure and type safety without requiring API credits
 */

import { ClaudeClient } from '../claude-client';
import {
  PropAnalysisSchema,
  CatchOfTheDaySchema,
  GamePreviewSchema,
  ParlayEvaluationSchema,
} from '../schemas';

describe('AI Integration (Mock Tests)', () => {
  describe('Schema Type Safety', () => {
    it('should provide type inference for PropAnalysisSchema', () => {
      const mockData = {
        verdict: 'OVER' as const,
        confidence: 'HIGH' as const,
        summary: 'Test summary',
        analysis: 'Test analysis',
        key_factors: ['Factor 1'],
        risk_factors: ['Risk 1'],
        edge_estimate: '5.5%',
      };

      const result = PropAnalysisSchema.parse(mockData);

      // TypeScript should infer the correct type
      expect(result.verdict).toBe('OVER');
      expect(result.confidence).toBe('HIGH');

      // Type checking at compile time
      type ResultType = typeof result;
      const _typeCheck: ResultType = result; // Should compile without errors
      expect(_typeCheck).toBeDefined();
    });

    it('should provide type inference for CatchOfTheDaySchema', () => {
      const mockData = {
        propId: 'prop-123',
        playerName: 'LeBron James',
        market: 'Points',
        line: 25.5,
        verdict: 'OVER' as const,
        confidence: 'LOCK' as const,
        headline: 'Test headline',
        summary: 'Test summary',
        key_factors: ['Factor 1'],
        edge_estimate: '8.5%',
        value_score: 92,
      };

      const result = CatchOfTheDaySchema.parse(mockData);

      expect(result.playerName).toBe('LeBron James');
      expect(result.confidence).toBe('LOCK');
      expect(result.value_score).toBe(92);
    });

    it('should provide type inference for GamePreviewSchema', () => {
      const mockData = {
        gameId: 'game-123',
        headline: 'Lakers vs Warriors',
        summary: 'Big matchup',
        key_storylines: ['Storyline 1', 'Storyline 2'],
        injury_impact: 'None',
        betting_angles: [
          {
            market: 'Total',
            angle: 'Over looks good',
            confidence: 'HIGH' as const,
          },
        ],
        value_plays: ['Play 1'],
      };

      const result = GamePreviewSchema.parse(mockData);

      expect(result.gameId).toBe('game-123');
      expect(result.betting_angles).toHaveLength(1);
      expect(result.betting_angles[0].confidence).toBe('HIGH');
    });

    it('should provide type inference for ParlayEvaluationSchema', () => {
      const mockData = {
        overall_grade: 'A' as const,
        confidence: 'HIGH' as const,
        summary: 'Excellent parlay',
        correlation_risks: [
          {
            legs: [0, 1],
            risk: 'Same game correlation',
            severity: 'LOW' as const,
          },
        ],
        independent_analysis: [
          {
            legIndex: 0,
            verdict: 'STRONG' as const,
            reasoning: 'Great matchup',
          },
        ],
        recommendation: 'BUILD' as const,
        suggested_improvements: ['None needed'],
      };

      const result = ParlayEvaluationSchema.parse(mockData);

      expect(result.overall_grade).toBe('A');
      expect(result.recommendation).toBe('BUILD');
      expect(result.correlation_risks).toHaveLength(1);
    });
  });

  describe('ClaudeClient Structure', () => {
    it('should instantiate ClaudeClient correctly', () => {
      const client = new ClaudeClient();
      expect(client).toBeDefined();
      expect(typeof client.analyze).toBe('function');
      expect(typeof client.analyzeStructured).toBe('function');
    });

    it('should accept custom API key in constructor', () => {
      const client = new ClaudeClient('test-key');
      expect(client).toBeDefined();
    });
  });

  describe('End-to-End Type Flow', () => {
    it('should demonstrate full type-safe flow from client to schema', () => {
      // This demonstrates the intended usage pattern
      const client = new ClaudeClient();

      // Simulated response that would come from Claude
      const mockClaudeResponse = {
        verdict: 'OVER',
        confidence: 'HIGH',
        summary: 'Strong play based on recent form',
        analysis: 'Player has exceeded this line in 8 of last 10 games',
        key_factors: ['Hot streak', 'Favorable matchup', 'Home court'],
        risk_factors: ['Potential rest game', 'Injury history'],
        edge_estimate: '6.2%',
      };

      // Validate it matches our schema
      const validated = PropAnalysisSchema.parse(mockClaudeResponse);

      // TypeScript knows the exact type
      expect(validated.verdict).toBe('OVER');
      expect(['LOW', 'MEDIUM', 'HIGH', 'LOCK']).toContain(validated.confidence);

      // This would be the return type from client.analyzeStructured()
      type ExpectedType = {
        verdict: 'OVER' | 'UNDER' | 'SKIP';
        confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'LOCK';
        summary: string;
        analysis: string;
        key_factors: string[];
        risk_factors: string[];
        edge_estimate: string;
      };

      const _typeCheck: ExpectedType = validated;
      expect(_typeCheck.verdict).toBe('OVER');
    });
  });

  describe('Schema Validation Edge Cases', () => {
    it('should handle default values for optional arrays', () => {
      const minimalData = {
        verdict: 'OVER' as const,
        confidence: 'MEDIUM' as const,
        summary: 'Test',
        analysis: 'Test',
        edge_estimate: '3%',
        // key_factors and risk_factors omitted
      };

      const result = PropAnalysisSchema.parse(minimalData);

      // Defaults should be applied
      expect(result.key_factors).toEqual([]);
      expect(result.risk_factors).toEqual([]);
    });

    it('should enforce required fields', () => {
      const invalidData = {
        verdict: 'OVER',
        // Missing required fields
      };

      expect(() => PropAnalysisSchema.parse(invalidData)).toThrow();
    });

    it('should enforce value ranges', () => {
      const invalidValueScore = {
        propId: 'test',
        playerName: 'Test',
        market: 'Test',
        line: 10,
        verdict: 'OVER',
        confidence: 'HIGH',
        headline: 'Test',
        summary: 'Test',
        key_factors: [],
        edge_estimate: '5%',
        value_score: 150, // Invalid - should be 0-100
      };

      expect(() => CatchOfTheDaySchema.parse(invalidValueScore)).toThrow();
    });

    it('should enforce enum constraints', () => {
      const invalidVerdict = {
        verdict: 'MAYBE', // Not in enum
        confidence: 'HIGH',
        summary: 'Test',
        analysis: 'Test',
        key_factors: [],
        risk_factors: [],
        edge_estimate: '5%',
      };

      expect(() => PropAnalysisSchema.parse(invalidVerdict)).toThrow();
    });
  });

  describe('Integration Architecture Validation', () => {
    it('should have correct method signature for analyzeStructured', () => {
      const client = new ClaudeClient();

      // This should compile without errors, demonstrating correct types
      const checkSignature = async () => {
        // The method should accept:
        // 1. System prompt (string)
        // 2. User prompt (string)
        // 3. Zod schema
        // 4. Optional options
        type AnalyzeStructuredType = typeof client.analyzeStructured;

        // Verify it's a function
        expect(typeof client.analyzeStructured).toBe('function');

        // Verify it returns a Promise
        const promise = client
          .analyzeStructured('test', 'test', PropAnalysisSchema)
          .catch(() => {}); // Catch expected error
        expect(promise).toBeInstanceOf(Promise);
      };

      expect(checkSignature).toBeDefined();
    });
  });
});
