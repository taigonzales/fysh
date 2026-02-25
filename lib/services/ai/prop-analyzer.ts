/**
 * Prop Analyzer Service
 * Orchestrates: database → stats → hit rates → Claude AI → analysis
 */
import { PrismaClient } from '@prisma/client';
import { ClaudeClient } from '@/lib/ai/claude-client';
import { buildPropAnalysisPrompt } from '@/lib/ai/prompts';
import { PropAnalysisSchema } from '@/lib/ai/schemas';
import { calculateAllHitRates } from './hit-rate-calculator';
import type { GameLog } from '@/lib/api/stats-api';

const prisma = new PrismaClient();
const claudeClient = new ClaudeClient();

export interface PropAnalysisResult {
  propId: string;
  playerName: string;
  propType: string;
  line: number;
  verdict: 'OVER' | 'UNDER' | 'SKIP';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'LOCK';
  summary: string;
  analysis: string;
  key_factors: string[];
  risk_factors: string[];
  edge_estimate: string;
  hitRates: {
    last5: number;
    last10: number;
    last25: number;
    season: number;
    vsOpponent: number | null;
  };
  analyzedAt: Date;
}

/**
 * Analyze a single prop using AI
 */
export async function analyzeProp(propId: string): Promise<PropAnalysisResult> {
  // 1. Fetch prop with game details
  const prop = await prisma.playerProp.findUnique({
    where: { id: propId },
    include: {
      game: true,
    },
  });

  if (!prop) {
    throw new Error(`Prop ${propId} not found`);
  }

  // 2. Get player stats
  const playerStats = await prisma.playerSeasonStats.findFirst({
    where: {
      playerName: prop.playerName,
      sport: prop.game.sport,
      season: prop.game.season,
    },
  });

  if (!playerStats) {
    throw new Error(
      `No stats available for ${prop.playerName} in ${prop.game.sport} ${prop.game.season}`
    );
  }

  // 3. Calculate hit rates
  const hitRates = await calculateAllHitRates(propId);

  // 4. Build Claude prompt
  const recentGames = (playerStats.last25Games as GameLog[])
    .slice(0, 5)
    .map((game) => {
      const statField = getStatFieldFromPropType(prop.propType);
      return game[statField] as number;
    });

  const seasonAvg = (playerStats.seasonAvg as Record<string, number>)[
    getStatFieldFromPropType(prop.propType)
  ] || 0;

  const opponent =
    prop.game.homeTeam === prop.playerName ? prop.game.awayTeam : prop.game.homeTeam;

  const { systemPrompt, userPrompt } = buildPropAnalysisPrompt({
    playerName: prop.playerName,
    propType: prop.propType,
    line: prop.line,
    team: prop.teamName || 'Unknown',
    opponent,
    gameTime: prop.game.startTime.toISOString(),
    hitRates: {
      last5: hitRates.hitRateLast5,
      last10: hitRates.hitRateLast10,
      last25: hitRates.hitRateLast25,
      season: hitRates.hitRateSeason,
      vsOpponent: hitRates.hitRateVsOpponent,
    },
    recentGames,
    seasonAvg,
  });

  // 5. Call Claude AI
  const aiAnalysis = await claudeClient.analyzeStructured(
    systemPrompt,
    userPrompt,
    PropAnalysisSchema
  );

  // 6. Return structured result
  return {
    propId: prop.id,
    playerName: prop.playerName,
    propType: prop.propType,
    line: prop.line,
    verdict: aiAnalysis.verdict,
    confidence: aiAnalysis.confidence,
    summary: aiAnalysis.summary,
    analysis: aiAnalysis.analysis,
    key_factors: aiAnalysis.key_factors,
    risk_factors: aiAnalysis.risk_factors,
    edge_estimate: aiAnalysis.edge_estimate,
    hitRates: {
      last5: hitRates.hitRateLast5,
      last10: hitRates.hitRateLast10,
      last25: hitRates.hitRateLast25,
      season: hitRates.hitRateSeason,
      vsOpponent: hitRates.hitRateVsOpponent,
    },
    analyzedAt: new Date(),
  };
}

/**
 * Map prop type to stat field name
 */
function getStatFieldFromPropType(propType: string): string {
  const mapping: Record<string, string> = {
    'Points': 'points',
    'Rebounds': 'rebounds',
    'Assists': 'assists',
    'Pts+Rebs+Asts': 'points', // Will need special handling
    'Three-Pointers Made': 'threePointersMade',
  };

  return mapping[propType] || 'points';
}

/**
 * Batch analyze multiple props
 */
export async function batchAnalyzeProps(propIds: string[]): Promise<PropAnalysisResult[]> {
  const results: PropAnalysisResult[] = [];

  for (const propId of propIds) {
    try {
      const result = await analyzeProp(propId);
      results.push(result);
    } catch (error) {
      console.error(`[PropAnalyzer] Failed to analyze prop ${propId}:`, error);
      // Continue with other props
    }
  }

  return results;
}
