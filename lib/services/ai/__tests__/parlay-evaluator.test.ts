import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock Prisma Client
const mockPrisma = {
  playerProp: {
    findUnique: jest.fn(),
  },
  game: {
    findUnique: jest.fn(),
  },
  aiInsight: {
    findFirst: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock ClaudeClient
jest.mock('@/lib/ai/claude-client', () => {
  return {
    ClaudeClient: jest.fn().mockImplementation(() => {
      return {
        analyzeStructured: jest.fn(),
      };
    }),
  };
});

import { evaluateParlay } from '../parlay-evaluator';
import { ClaudeClient } from '@/lib/ai/claude-client';

describe('Parlay Evaluator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluateParlay', () => {
    test('evaluates multi-leg parlay for correlation risks', async () => {
      // Mock prop data
      mockPrisma.playerProp.findUnique
        .mockResolvedValueOnce({
          id: 'prop-1',
          playerName: 'LeBron James',
          propType: 'Points',
          line: 25.5,
          game: { id: 'game-1', homeTeam: 'Lakers', awayTeam: 'Warriors' },
        })
        .mockResolvedValueOnce({
          id: 'prop-2',
          playerName: 'Anthony Davis',
          propType: 'Rebounds',
          line: 10.5,
          game: { id: 'game-1', homeTeam: 'Lakers', awayTeam: 'Warriors' },
        });

      // Mock prop analyses from database
      mockPrisma.aiInsight.findFirst
        .mockResolvedValueOnce({
          structuredData: {
            propId: 'prop-1',
            verdict: 'OVER',
            confidence: 'HIGH',
            summary: 'Strong over play',
            hitRates: { last10: 0.75 },
          },
        })
        .mockResolvedValueOnce({
          structuredData: {
            propId: 'prop-2',
            verdict: 'OVER',
            confidence: 'MEDIUM',
            summary: 'Moderate over play',
            hitRates: { last10: 0.65 },
          },
        });

      // Mock AI response
      const mockAiResponse = {
        overall_grade: 'B' as const,
        confidence: 'MEDIUM' as const,
        summary: 'Moderate parlay with some correlation risk',
        correlation_risks: [
          {
            legs: [0, 1],
            risk: 'Both players on same team - negative correlation',
            severity: 'MEDIUM' as const,
          },
        ],
        independent_analysis: [
          {
            legIndex: 0,
            verdict: 'STRONG' as const,
            reasoning: 'LeBron hitting points over consistently',
          },
          {
            legIndex: 1,
            verdict: 'GOOD' as const,
            reasoning: 'AD solid rebounding matchup',
          },
        ],
        recommendation: 'PROCEED' as const,
        suggested_improvements: ['Consider different game for leg 2'],
      };

      const mockAnalyzeStructured = jest.fn().mockResolvedValue(mockAiResponse);
      (ClaudeClient as jest.MockedClass<typeof ClaudeClient>).mockImplementation(() => {
        return {
          analyzeStructured: mockAnalyzeStructured,
        } as any;
      });

      const result = await evaluateParlay([{ propId: 'prop-1' }, { propId: 'prop-2' }]);

      expect(result).toBeDefined();
      expect(result.overall_grade).toBe('B');
      expect(result.correlation_risks).toHaveLength(1);
      expect(result.independent_analysis).toHaveLength(2);
      expect(result.evaluatedAt).toBeInstanceOf(Date);
    });

    test('throws error for single-leg parlay', async () => {
      await expect(evaluateParlay([{ propId: 'prop-1' }])).rejects.toThrow(
        'Parlay must have at least 2 legs'
      );
    });
  });
});
