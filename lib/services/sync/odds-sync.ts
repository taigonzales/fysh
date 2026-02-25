/**
 * Odds synchronization service
 * Fetches and stores odds snapshots for upcoming games
 */

import { PrismaClient } from '@prisma/client'
import {
  oddsApiClient,
  SPORT_KEYS,
  transformAllOdds,
  DEFAULT_MARKETS,
  hasRateLimitQuota,
} from '@/lib/api/odds-api'
import type { TransformedOdds } from '@/lib/api/odds-api'
import {
  isWithinUpcomingWindow,
  prioritizeGames,
  calculateGamePriority,
  getRefreshInterval,
  isDataStale,
  createSyncResult,
  logSyncResult,
  withLock,
  type SyncResult,
} from './utils'

const prisma = new PrismaClient()

// ============================================
// Odds Sync
// ============================================

/**
 * Sync odds for a specific sport
 */
export async function syncOddsForSport(sport: string): Promise<SyncResult> {
  const startTime = Date.now()
  const result = createSyncResult()

  try {
    // Check API quota
    if (!hasRateLimitQuota(5)) {
      result.success = false
      result.errors.push('Insufficient API quota')
      return result
    }

    const sportKey = SPORT_KEYS[sport]
    if (!sportKey) {
      result.success = false
      result.errors.push(`Invalid sport: ${sport}`)
      return result
    }

    console.log(`[OddsSync] Fetching odds for ${sport}...`)

    // Fetch odds from API (with QuickSlip deep links enabled)
    const events = await oddsApiClient.getOdds({
      sport: sportKey,
      markets: DEFAULT_MARKETS,
      includeLinks: true, // Enable QuickSlip deep links
    })

    const allOdds = transformAllOdds(events)

    console.log(`[OddsSync] Found ${allOdds.length} odds for ${sport}`)

    // Match odds to games in database
    const gameExternalIds = [...new Set(allOdds.map((o) => o.gameExternalId))]

    const games = await prisma.game.findMany({
      where: {
        externalId: {
          in: gameExternalIds,
        },
      },
    })

    const gameIdMap = new Map(games.map((g) => [g.externalId, g.id]))

    // Store odds snapshots
    for (const odds of allOdds) {
      const gameId = gameIdMap.get(odds.gameExternalId)

      if (!gameId) {
        result.itemsSkipped++
        continue
      }

      try {
        await prisma.odds.create({
          data: {
            gameId,
            sportsbook: odds.sportsbook,
            marketType: odds.marketType,
            homeLine: odds.homeLine,
            awayLine: odds.awayLine,
            homeOdds: odds.homeOdds,
            awayOdds: odds.awayOdds,
            overUnder: odds.overUnder,
            overOdds: odds.overOdds,
            underOdds: odds.underOdds,
            fetchedAt: odds.fetchedAt,
            // QuickSlip fields
            bookmakerEventId: odds.bookmakerEventId,
            bookmakerMarketId: odds.bookmakerMarketId,
            bookmakerSelectionId: odds.bookmakerSelectionId,
            deeplinkUrl: odds.deeplinkUrl,
          },
        })

        result.itemsCreated++
        result.itemsProcessed++
      } catch (error) {
        result.errors.push(
          `Failed to store odds: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    result.success = result.errors.length === 0
  } catch (error) {
    result.success = false
    result.errors.push(
      `Odds sync failed for ${sport}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  } finally {
    result.duration = Date.now() - startTime
    logSyncResult(`Odds:${sport}`, result)
  }

  return result
}

/**
 * Sync odds for priority games only
 * This is the recommended approach to conserve API quota
 */
export async function syncPriorityOdds(): Promise<SyncResult> {
  return withLock('sync-odds', async () => {
    const startTime = Date.now()
    const result = createSyncResult()

    try {
      console.log('[OddsSync] Starting priority odds sync...')

      // Get upcoming games
      const upcomingGames = await prisma.game.findMany({
        where: {
          status: {
            in: ['SCHEDULED', 'LIVE'],
          },
          startTime: {
            gte: new Date(), // Future games
          },
        },
        include: {
          odds: {
            orderBy: {
              fetchedAt: 'desc',
            },
            take: 1,
          },
        },
      })

      // Filter to games within upcoming window
      const gamesInWindow = upcomingGames.filter(isWithinUpcomingWindow)

      // Prioritize games
      const prioritizedGames = prioritizeGames(gamesInWindow)

      console.log(
        `[OddsSync] Found ${prioritizedGames.length} games to sync (from ${upcomingGames.length} total upcoming)`
      )

      // Process games by priority
      for (const game of prioritizedGames) {
        // Check if we need to refresh odds for this game
        const priority = calculateGamePriority(game)
        const refreshInterval = getRefreshInterval(priority)

        // Check if we have recent odds
        const latestOdds = game.odds[0]
        if (latestOdds && !isDataStale(latestOdds.fetchedAt, refreshInterval)) {
          console.log(
            `[OddsSync] Skipping ${game.sport} - ${game.awayTeam} @ ${game.homeTeam} (odds fresh, fetched ${Math.round((Date.now() - latestOdds.fetchedAt.getTime()) / 1000 / 60)}min ago)`
          )
          result.itemsSkipped++
          continue
        }

        // Check quota before each request
        if (!hasRateLimitQuota(3)) {
          console.warn('[OddsSync] Stopping due to low API quota')
          result.errors.push('Low API quota - sync incomplete')
          break
        }

        console.log(
          `[OddsSync] Syncing ${priority} priority: ${game.sport} - ${game.awayTeam} @ ${game.homeTeam}`
        )

        // Fetch odds for this specific game
        const sportKey = SPORT_KEYS[game.sport]
        if (!sportKey) continue

        try {
          const event = await oddsApiClient.getEventOdds(sportKey, game.externalId, {
            markets: DEFAULT_MARKETS,
            includeLinks: true,
          })

          const odds = transformAllOdds([event])

          // Store odds
          for (const oddsSnapshot of odds) {
            await prisma.odds.create({
              data: {
                gameId: game.id,
                sportsbook: oddsSnapshot.sportsbook,
                marketType: oddsSnapshot.marketType,
                homeLine: oddsSnapshot.homeLine,
                awayLine: oddsSnapshot.awayLine,
                homeOdds: oddsSnapshot.homeOdds,
                awayOdds: oddsSnapshot.awayOdds,
                overUnder: oddsSnapshot.overUnder,
                overOdds: oddsSnapshot.overOdds,
                underOdds: oddsSnapshot.underOdds,
                fetchedAt: oddsSnapshot.fetchedAt,
                bookmakerEventId: oddsSnapshot.bookmakerEventId,
                bookmakerMarketId: oddsSnapshot.bookmakerMarketId,
                bookmakerSelectionId: oddsSnapshot.bookmakerSelectionId,
                deeplinkUrl: oddsSnapshot.deeplinkUrl,
              },
            })
          }

          result.itemsCreated += odds.length
          result.itemsProcessed++
        } catch (error) {
          result.errors.push(
            `Failed to sync odds for game ${game.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      }

      result.success = result.errors.length === 0
    } catch (error) {
      result.success = false
      result.errors.push(
        `Priority odds sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      result.duration = Date.now() - startTime
      logSyncResult('Odds:Priority', result)
    }

    return result
  }) || createSyncResult()
}

/**
 * Cleanup old odds snapshots
 * Keep only the latest snapshot per game/sportsbook/market combination
 */
export async function cleanupOldOdds(): Promise<SyncResult> {
  const startTime = Date.now()
  const result = createSyncResult()

  try {
    // Keep only odds from the last 7 days
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 7)

    const deleteResult = await prisma.odds.deleteMany({
      where: {
        fetchedAt: {
          lt: cutoffDate,
        },
      },
    })

    result.itemsProcessed = deleteResult.count
    result.success = true

    console.log(`[OddsSync] Cleaned up ${deleteResult.count} old odds snapshots`)
  } catch (error) {
    result.success = false
    result.errors.push(
      `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  } finally {
    result.duration = Date.now() - startTime
  }

  return result
}

/**
 * Get best odds for a game (for display purposes)
 */
export async function getBestOdds(gameId: string, marketType: string) {
  const odds = await prisma.odds.findMany({
    where: {
      gameId,
      marketType: marketType as any,
    },
    orderBy: {
      fetchedAt: 'desc',
    },
    take: 50, // Get recent odds from all books
  })

  // Group by sportsbook and get latest
  const latestByBook = new Map<string, typeof odds[0]>()

  for (const odd of odds) {
    const existing = latestByBook.get(odd.sportsbook)
    if (!existing || odd.fetchedAt > existing.fetchedAt) {
      latestByBook.set(odd.sportsbook, odd)
    }
  }

  return Array.from(latestByBook.values())
}
