import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock Prisma Client
const mockPrisma = {
  game: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  aiInsight: {
    create: jest.fn(),
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

import { generateGamePreview } from '../game-preview';
import { ClaudeClient } from '@/lib/ai/claude-client';

describe('Game Preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateGamePreview', () => {
    test('generates preview for a game', async () => {
      // Mock game data
      const mockGame = {
        id: 'game-123',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        sport: 'NBA',
        startTime: new Date('2026-03-15T19:00:00Z'),
        season: '2025-26',
      };

      mockPrisma.game.findUnique.mockResolvedValue(mockGame);
      mockPrisma.aiInsight.create.mockResolvedValue({ id: 'insight-1' } as any);

      // Mock AI response
      const mockAiResponse = {
        gameId: 'game-123',
        headline: 'Lakers vs Warriors: Battle for the West',
        summary: 'High-stakes matchup between conference rivals',
        key_storylines: ['LeBron return from injury', 'Curry hot streak'],
        injury_impact: 'AD questionable, could impact rebounding',
        betting_angles: [
          {
            market: 'Spread',
            angle: 'Take Warriors -5.5',
            confidence: 'HIGH' as const,
          },
        ],
        value_plays: ['Warriors ML', 'Under 225.5'],
      };

      // Set up the AI mock
      const mockAnalyzeStructured = jest.fn().mockResolvedValue(mockAiResponse);
      (ClaudeClient as jest.MockedClass<typeof ClaudeClient>).mockImplementation(() => {
        return {
          analyzeStructured: mockAnalyzeStructured,
        } as any;
      });

      const result = await generateGamePreview('game-123');

      expect(result).toBeDefined();
      expect(result.gameId).toBe('game-123');
      expect(result.headline).toBe('Lakers vs Warriors: Battle for the West');
      expect(result.betting_angles).toHaveLength(1);
      expect(result.publishedAt).toBeInstanceOf(Date);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });
});
