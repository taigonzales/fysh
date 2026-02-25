/**
 * Hit rate calculator for player props
 */
import { PrismaClient } from '@prisma/client';
import type { GameLog } from '@/lib/api/stats-api';
import type { HitRates, SyncResult } from './types';
import { createSyncResult, logSyncResult, calculatePercentage, withLock } from './utils';

const prisma = new PrismaClient();

/**
 * Calculate hit rate from game logs
 */
export function calculateHitRateFromGames(
  games: GameLog[],
  line: number,
  statField: string
): number {
  if (games.length === 0) return 0;

  const hits = games.filter((game) => {
    const value = game[statField];
    return typeof value === 'number' && value > line;
  }).length;

  return calculatePercentage(hits, games.length);
}

/**
 * Calculate all hit rates for a single prop
 */
export async function calculateAllHitRates(propId: string): Promise<HitRates> {
  const prop = await prisma.playerProp.findUnique({
    where: { id: propId },
    include: {
      game: true,
    },
  });

  if (!prop) {
    throw new Error(`Prop ${propId} not found`);
  }

  // Fetch player stats from cache
  const playerStats = await prisma.playerSeasonStats.findFirst({
    where: {
      playerName: prop.playerName,
      sport: prop.game.sport,
      season: prop.game.season,
    },
  });

  if (!playerStats) {
    // No stats available yet, return zeros
    return {
      hitRateLast5: 0,
      hitRateLast10: 0,
      hitRateLast25: 0,
      hitRateSeason: 0,
      hitRateVsOpponent: 0,
    };
  }

  const allGames = playerStats.last25Games as GameLog[];
  const statField = getStatFieldFromPropType(prop.propType);
  const line = prop.line;

  // Calculate hit rates for different time periods
  const last5Games = allGames.slice(0, 5);
  const last10Games = allGames.slice(0, 10);
  const last25Games = allGames;

  // Calculate vs opponent hit rate
  const vsOpponentGames = (
    (playerStats.vsOpponents as Record<string, GameLog[]>)[prop.game.awayTeam] ||
    (playerStats.vsOpponents as Record<string, GameLog[]>)[prop.game.homeTeam] ||
    []
  );

  return {
    hitRateLast5: calculateHitRateFromGames(last5Games, line, statField),
    hitRateLast10: calculateHitRateFromGames(last10Games, line, statField),
    hitRateLast25: calculateHitRateFromGames(last25Games, line, statField),
    hitRateSeason: calculateHitRateFromGames(allGames, line, statField),
    hitRateVsOpponent: calculateHitRateFromGames(vsOpponentGames, line, statField),
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
 * Calculate hit rates for all upcoming props (batch)
 */
export async function batchCalculateHitRates(): Promise<SyncResult> {
  return (await withLock('batch-calculate-hit-rates', async () => {
    const startTime = Date.now();
    const result = createSyncResult();

    try {
      // Get all upcoming props
      const props = await prisma.playerProp.findMany({
        where: {
          game: {
            status: 'SCHEDULED',
            startTime: {
              gte: new Date(),
              lte: new Date(Date.now() + 48 * 60 * 60 * 1000), // Next 48 hours
            },
          },
        },
      });

      console.log(`[HitRateCalc] Calculating hit rates for ${props.length} props`);

      for (const prop of props) {
        try {
          const hitRates = await calculateAllHitRates(prop.id);

          // Update prop with hit rates
          await prisma.playerProp.update({
            where: { id: prop.id },
            data: {
              hitRateLast5: hitRates.hitRateLast5,
              hitRateLast10: hitRates.hitRateLast10,
              hitRateLast25: hitRates.hitRateLast25,
              hitRateSeason: hitRates.hitRateSeason,
              hitRateVsOpponent: hitRates.hitRateVsOpponent,
            },
          });

          result.itemsProcessed++;
        } catch (error) {
          result.itemsFailed++;
          result.errors.push(`Prop ${prop.id}: ${error}`);
        }
      }

      result.duration = Date.now() - startTime;
      logSyncResult('HitRateCalc', result);

      return result;
    } catch (error) {
      console.error('[HitRateCalc] Fatal error:', error);
      result.errors.push(`Fatal: ${error}`);
      return result;
    }
  })) || createSyncResult();
}
