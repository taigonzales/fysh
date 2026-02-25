import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import type { PropAnalysisResult } from '../prop-analyzer';

// Mock ClaudeClient before importing the module
jest.mock('@/lib/ai/claude-client', () => {
  return {
    ClaudeClient: jest.fn().mockImplementation(() => {
      return {
        analyzeStructured: jest.fn(),
      };
    }),
  };
});

import { selectCatchOfTheDay } from '../catch-of-day';
import { ClaudeClient } from '@/lib/ai/claude-client';

describe('Catch of the Day', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('selectCatchOfTheDay', () => {
    test('selects catch from high-confidence analyses', async () => {
      // Mock AI response
      const mockAiResponse = {
        propId: 'prop-1',
        playerName: 'LeBron James',
        market: 'Points',
        line: 25.5,
        verdict: 'OVER' as const,
        confidence: 'HIGH' as const,
        headline: 'LeBron Over 25.5 Points - Lock It In',
        summary: 'Strong over play based on recent form',
        key_factors: ['Hot streak', 'Favorable matchup'],
        edge_estimate: '60%',
        value_score: 85,
      };

      // Set up the mock to return our response
      const mockAnalyzeStructured = jest.fn().mockResolvedValue(mockAiResponse);
      (ClaudeClient as jest.MockedClass<typeof ClaudeClient>).mockImplementation(() => {
        return {
          analyzeStructured: mockAnalyzeStructured,
        } as any;
      });

      const mockAnalyses: PropAnalysisResult[] = [
        {
          propId: 'prop-1',
          playerName: 'LeBron James',
          propType: 'Points',
          line: 25.5,
          verdict: 'OVER',
          confidence: 'HIGH',
          summary: 'Strong over play',
          analysis: 'LeBron has hit this line in 8/10 games',
          key_factors: ['Hot streak', 'Favorable matchup'],
          risk_factors: [],
          edge_estimate: '60%',
          hitRates: {
            last5: 0.8,
            last10: 0.75,
            last25: 0.72,
            season: 0.68,
            vsOpponent: 0.85,
          },
          analyzedAt: new Date(),
        },
      ];

      const result = await selectCatchOfTheDay(mockAnalyses);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.propId).toBe('prop-1');
      expect(result.playerName).toBe('LeBron James');
      expect(result.confidence).toBe('HIGH');
      expect(result.headline).toBe('LeBron Over 25.5 Points - Lock It In');
      expect(result.publishedAt).toBeInstanceOf(Date);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    test('throws error when no high-confidence props available', async () => {
      const mockAnalyses: PropAnalysisResult[] = [
        {
          propId: 'prop-1',
          playerName: 'Player Name',
          propType: 'Points',
          line: 20.5,
          verdict: 'OVER',
          confidence: 'LOW', // Not HIGH or LOCK
          summary: 'Weak play',
          analysis: 'Analysis',
          key_factors: [],
          risk_factors: [],
          edge_estimate: '45%',
          hitRates: {
            last5: 0.4,
            last10: 0.45,
            last25: 0.42,
            season: 0.48,
            vsOpponent: 0.5,
          },
          analyzedAt: new Date(),
        },
      ];

      await expect(selectCatchOfTheDay(mockAnalyses)).rejects.toThrow(
        'No high-confidence props available'
      );
    });

    test('filters to only OVER/UNDER verdicts', async () => {
      const mockAnalyses: PropAnalysisResult[] = [
        {
          propId: 'prop-skip',
          playerName: 'Skip Player',
          propType: 'Points',
          line: 20.5,
          verdict: 'SKIP', // Should be filtered out
          confidence: 'HIGH',
          summary: 'Skip this',
          analysis: 'Analysis',
          key_factors: [],
          risk_factors: [],
          edge_estimate: '55%',
          hitRates: {
            last5: 0.6,
            last10: 0.65,
            last25: 0.62,
            season: 0.58,
            vsOpponent: 0.6,
          },
          analyzedAt: new Date(),
        },
      ];

      await expect(selectCatchOfTheDay(mockAnalyses)).rejects.toThrow(
        'No high-confidence props available'
      );
    });
  });
});
