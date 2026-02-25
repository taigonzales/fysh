/**
 * Parlay Evaluator Service
 * Evaluates multi-leg parlays for correlation risks and overall quality
 */
import { ClaudeClient } from '@/lib/ai/claude-client';
import { ParlayEvaluationSchema } from '@/lib/ai/schemas';
import { buildParlayEvaluationPrompt } from '@/lib/ai/prompts';
import type { ParlayEvaluation } from '@/lib/ai/schemas';
import type { PropAnalysisResult } from './prop-analyzer';

export interface ParlayLegInput {
  propId: string;
  analysis?: PropAnalysisResult;
}

export interface ParlayEvaluationResult extends ParlayEvaluation {
  evaluatedAt: Date;
}

/**
 * Evaluate a multi-leg parlay for correlation risks
 * NOTE: This is on-demand only - does NOT save to database
 */
export async function evaluateParlay(
  legs: ParlayLegInput[]
): Promise<ParlayEvaluationResult> {
  // Validate input
  if (legs.length < 2) {
    throw new Error('Parlay must have at least 2 legs');
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Fetch or use provided analyses
    const parlayLegs = await Promise.all(
      legs.map(async (leg) => {
        // If analysis provided, use it; otherwise fetch from database
        const analysis =
          leg.analysis || (await fetchPropAnalysis(prisma, leg.propId));

        // Fetch prop details
        const prop = await prisma.playerProp.findUnique({
          where: { id: leg.propId },
          include: { game: true },
        });

        if (!prop) {
          throw new Error(`Prop ${leg.propId} not found`);
        }

        // Transform to format expected by prompt
        return {
          propId: prop.id,
          playerName: prop.playerName,
          market: prop.propType,
          line: prop.line,
          verdict: analysis.verdict,
          confidence: analysis.confidence,
          gameId: prop.game.id,
          homeTeam: prop.game.homeTeam,
          awayTeam: prop.game.awayTeam,
          hitRate: analysis.hitRates.last10,
          analysis: analysis.summary,
        };
      })
    );

    // Call AI to evaluate
    const { systemPrompt, userPrompt } = buildParlayEvaluationPrompt(parlayLegs);

    const claudeClient = new ClaudeClient();
    const aiResult = await claudeClient.analyzeStructured(
      systemPrompt,
      userPrompt,
      ParlayEvaluationSchema
    );

    return {
      ...aiResult,
      evaluatedAt: new Date(),
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetch prop analysis from database
 */
async function fetchPropAnalysis(
  prisma: any,
  propId: string
): Promise<PropAnalysisResult> {
  const analysis = await prisma.aiInsight.findFirst({
    where: {
      type: 'PROP_ANALYSIS',
      propId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { publishedAt: 'desc' },
  });

  if (!analysis) {
    // If no analysis exists, compute it fresh
    const { analyzeProp } = await import('./prop-analyzer');
    return await analyzeProp(propId);
  }

  return analysis.structuredData as PropAnalysisResult;
}
