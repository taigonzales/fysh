/**
 * Game Preview Service
 * Generates pre-game betting analysis with key storylines and angles
 */
import { ClaudeClient } from '@/lib/ai/claude-client';
import { GamePreviewSchema } from '@/lib/ai/schemas';
import { buildGamePreviewPrompt } from '@/lib/ai/prompts';
import type { GamePreview } from '@/lib/ai/schemas';
import { withLock, createSyncResult, logSyncResult, sleep } from './utils';
import type { SyncResult } from './types';

export interface GamePreviewResult extends GamePreview {
  id: string;
  publishedAt: Date;
  expiresAt: Date;
}

/**
 * Generate comprehensive pre-game preview with betting angles
 */
export async function generateGamePreview(gameId: string): Promise<GamePreviewResult> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Fetch game with relations
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }

    // Build AI prompt with context
    const { systemPrompt, userPrompt } = buildGamePreviewPrompt({
      gameId: game.id,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      gameTime: game.startTime.toISOString(),
      venue: `${game.homeTeam} Arena`, // TODO: Fetch actual venue
      homeRecord: '0-0', // TODO: Fetch actual records
      awayRecord: '0-0',
      injuries: [], // TODO: Fetch injury data
      trends: {
        homeTeamLast10: '5-5', // TODO: Calculate from games
        awayTeamLast10: '6-4',
        headToHead: '1-1 in last 2',
      },
    });

    // Call AI
    const claudeClient = new ClaudeClient();
    const aiResult = await claudeClient.analyzeStructured(
      systemPrompt,
      userPrompt,
      GamePreviewSchema
    );

    // Calculate expiry (4 hours after game start)
    const expiresAt = new Date(game.startTime);
    expiresAt.setHours(expiresAt.getHours() + 4);

    const result: GamePreviewResult = {
      id: `preview-${Date.now()}`,
      ...aiResult,
      publishedAt: new Date(),
      expiresAt,
    };

    // Save to database
    await prisma.aiInsight.create({
      data: {
        type: 'GAME_PREVIEW',
        title: aiResult.headline,
        content: aiResult.summary,
        structuredData: result as any,
        sport: game.sport,
        gameId: game.id,
        propId: null,
        publishedAt: result.publishedAt,
        expiresAt: result.expiresAt,
      },
    });

    return result;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get existing game preview from database
 */
export async function getGamePreview(gameId: string): Promise<GamePreviewResult | null> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const preview = await prisma.aiInsight.findFirst({
      where: {
        type: 'GAME_PREVIEW',
        gameId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!preview) {
      return null;
    }

    return preview.structuredData as GamePreviewResult;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Batch generate previews for upcoming games
 */
export async function batchGenerateGamePreviews(
  sport?: string,
  hoursAhead: number = 48
): Promise<SyncResult> {
  const startTime = Date.now();
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const result = await withLock('batch-game-previews', async () => {
    const syncResult = createSyncResult();

    try {
      // Query upcoming games
      const now = new Date();
      const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

      const upcomingGames = await prisma.game.findMany({
        where: {
          sport: sport || undefined,
          startTime: {
            gte: now,
            lte: futureTime,
          },
        },
        orderBy: { startTime: 'asc' },
      });

      console.log(`[GamePreview] Found ${upcomingGames.length} upcoming games`);

      for (const game of upcomingGames) {
        try {
          // Check if preview already exists
          const existing = await getGamePreview(game.id);
          if (existing) {
            syncResult.itemsSkipped++;
            console.log(`[GamePreview] Skipping ${game.id} - preview exists`);
            continue;
          }

          // Generate new preview
          console.log(`[GamePreview] Generating preview for ${game.id}...`);
          await generateGamePreview(game.id);
          syncResult.itemsProcessed++;

          // Rate limiting
          await sleep(1000);
        } catch (error) {
          syncResult.itemsFailed++;
          syncResult.errors.push(`${game.id}: ${(error as Error).message}`);
          console.error(`[GamePreview] Failed for ${game.id}:`, error);
        }
      }
    } finally {
      await prisma.$disconnect();
    }

    syncResult.duration = Date.now() - startTime;
    logSyncResult('GamePreview', syncResult);
    return syncResult;
  });

  return result || createSyncResult();
}
