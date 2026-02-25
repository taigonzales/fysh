/**
 * Catch of the Day Service
 * Selects and features the best daily prop from high-confidence analyses
 */
import { ClaudeClient } from '@/lib/ai/claude-client';
import { CatchOfTheDaySchema } from '@/lib/ai/schemas';
import { buildCatchOfTheDayPrompt } from '@/lib/ai/prompts';
import type { PropAnalysisResult } from './prop-analyzer';
import type { CatchOfTheDay } from '@/lib/ai/schemas';
import { withLock, createSyncResult, logSyncResult, sleep } from './utils';
import type { SyncResult } from './types';

export interface CatchOfTheDayResult extends CatchOfTheDay {
  id: string;
  publishedAt: Date;
  expiresAt: Date;
}

/**
 * Select best prop from high-confidence analyses using AI
 */
export async function selectCatchOfTheDay(
  analyses: PropAnalysisResult[]
): Promise<CatchOfTheDayResult> {
  // Filter to HIGH/LOCK confidence with OVER/UNDER verdict
  const candidates = analyses.filter(
    (a) =>
      (a.confidence === 'HIGH' || a.confidence === 'LOCK') &&
      (a.verdict === 'OVER' || a.verdict === 'UNDER')
  );

  if (candidates.length === 0) {
    throw new Error('No high-confidence props available');
  }

  // Transform to format expected by prompt
  const candidateProps = candidates.map((analysis) => ({
    id: analysis.propId,
    playerName: analysis.playerName,
    propType: analysis.propType,
    line: analysis.line,
    team: analysis.playerName, // TODO: Get actual team from analysis
    opponent: 'Unknown', // TODO: Get actual opponent from analysis
    hitRate: analysis.hitRates.last10,
    edge: parseFloat(analysis.edge_estimate.replace('%', '')) / 100,
  }));

  // Call AI to select the best catch
  const { systemPrompt, userPrompt } = buildCatchOfTheDayPrompt(candidateProps);

  const claudeClient = new ClaudeClient();
  const aiResult = await claudeClient.analyzeStructured(
    systemPrompt,
    userPrompt,
    CatchOfTheDaySchema
  );

  // Return with metadata
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 999);

  return {
    id: `catch-${now.getTime()}`,
    ...aiResult,
    publishedAt: now,
    expiresAt,
  };
}

/**
 * Generate and save Catch of the Day for a sport
 */
export async function generateCatchOfTheDay(
  sport?: string
): Promise<CatchOfTheDayResult | null> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Fetch high-confidence prop analyses from database
    const highConfidenceProps = await prisma.aiInsight.findMany({
      where: {
        type: 'PROP_ANALYSIS',
        sport: sport || undefined,
        expiresAt: { gt: new Date() },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    if (highConfidenceProps.length === 0) {
      console.log('[CatchOfDay] No props available for analysis');
      return null;
    }

    // Transform to PropAnalysisResult format
    const analyses: PropAnalysisResult[] = highConfidenceProps
      .map((insight) => insight.structuredData as any)
      .filter(
        (data) =>
          data &&
          (data.confidence === 'HIGH' || data.confidence === 'LOCK') &&
          (data.verdict === 'OVER' || data.verdict === 'UNDER')
      );

    if (analyses.length === 0) {
      console.log('[CatchOfDay] No high-confidence props available');
      return null;
    }

    // Select the best catch
    const catchResult = await selectCatchOfTheDay(analyses);

    // Save to database
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    await prisma.aiInsight.create({
      data: {
        type: 'CATCH_OF_DAY',
        title: catchResult.headline,
        content: catchResult.summary,
        structuredData: catchResult as any,
        sport: sport || 'ALL',
        gameId: null,
        propId: catchResult.propId,
        publishedAt: catchResult.publishedAt,
        expiresAt: catchResult.expiresAt,
      },
    });

    return catchResult;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get today's catch from database
 */
export async function getTodaysCatch(
  sport?: string
): Promise<CatchOfTheDayResult | null> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const catch_ = await prisma.aiInsight.findFirst({
      where: {
        type: 'CATCH_OF_DAY',
        sport: sport || undefined,
        expiresAt: { gt: new Date() },
        publishedAt: { gte: startOfDay },
      },
      orderBy: { publishedAt: 'desc' },
    });

    if (!catch_) {
      return null;
    }

    return catch_.structuredData as CatchOfTheDayResult;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Batch generate daily catches for all sports
 */
export async function batchGenerateDailyCatches(): Promise<SyncResult> {
  const startTime = Date.now();
  const sports = ['NBA', 'NFL', 'MLB', 'NHL'];

  const result = await withLock('batch-catch-of-day', async () => {
    const syncResult = createSyncResult();

    for (const sport of sports) {
      try {
        console.log(`[CatchOfDay] Generating catch for ${sport}...`);
        const catch_ = await generateCatchOfTheDay(sport);

        if (catch_) {
          syncResult.itemsProcessed++;
          console.log(`[CatchOfDay] Generated catch for ${sport}: ${catch_.headline}`);
        } else {
          syncResult.itemsSkipped++;
          console.log(`[CatchOfDay] No qualifying props for ${sport}`);
        }

        // Rate limiting: 1 second between AI calls
        await sleep(1000);
      } catch (error) {
        syncResult.itemsFailed++;
        syncResult.errors.push(`${sport}: ${(error as Error).message}`);
        console.error(`[CatchOfDay] Failed to generate catch for ${sport}:`, error);
      }
    }

    syncResult.duration = Date.now() - startTime;
    logSyncResult('CatchOfDay', syncResult);
    return syncResult;
  });

  return result || createSyncResult();
}
