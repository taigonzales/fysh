/**
 * Game synchronization service
 * Fetches and updates games from The Odds API
 */

import { PrismaClient } from '@prisma/client'
import { oddsApiClient, SPORT_KEYS, transformGames } from '@/lib/api/odds-api'
import type { TransformedGame } from '@/lib/api/odds-api'
import {
  getUpcomingGamesWindow,
  createSyncResult,
  logSyncResult,
  withLock,
  type SyncResult,
} from './utils'

const prisma = new PrismaClient()

// ============================================
// Game Sync
// ============================================

/**
 * Sync games for a specific sport
 */
export async function syncGamesForSport(sport: string): Promise<SyncResult> {
  const startTime = Date.now()
  const result = createSyncResult()

  try {
    const sportKey = SPORT_KEYS[sport]
    if (!sportKey) {
      result.success = false
      result.errors.push(`Invalid sport: ${sport}`)
      return result
    }

    console.log(`[GameSync] Fetching events for ${sport}...`)

    // Fetch events from API
    const events = await oddsApiClient.getEvents(sportKey)
    const games = transformGames(events)

    console.log(`[GameSync] Found ${games.length} games for ${sport}`)

    // Filter to upcoming games window
    const window = getUpcomingGamesWindow()
    const upcomingGames = games.filter(
      (game) => game.startTime >= window.start && game.startTime <= window.end
    )

    console.log(
      `[GameSync] ${upcomingGames.length} games within window (${window.start.toISOString()} - ${window.end.toISOString()})`
    )

    // Upsert games to database
    for (const game of upcomingGames) {
      try {
        const existing = await prisma.game.findUnique({
          where: { externalId: game.externalId },
        })

        if (existing) {
          // Update existing game
          await prisma.game.update({
            where: { externalId: game.externalId },
            data: {
              homeTeam: game.homeTeam,
              awayTeam: game.awayTeam,
              startTime: game.startTime,
              status: game.status,
              season: game.season,
              week: game.week,
            },
          })
          result.itemsUpdated++
        } else {
          // Create new game
          await prisma.game.create({
            data: {
              externalId: game.externalId,
              sport: game.sport,
              homeTeam: game.homeTeam,
              awayTeam: game.awayTeam,
              homeTeamAbbr: game.homeTeamAbbr,
              awayTeamAbbr: game.awayTeamAbbr,
              startTime: game.startTime,
              status: game.status,
              season: game.season,
              week: game.week,
            },
          })
          result.itemsCreated++
        }

        result.itemsProcessed++
      } catch (error) {
        const errorMsg = `Failed to upsert game ${game.externalId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        result.errors.push(errorMsg)
        console.error(`[GameSync] ${errorMsg}`)
      }
    }

    result.success = result.errors.length === 0
  } catch (error) {
    result.success = false
    const errorMsg = `Game sync failed for ${sport}: ${error instanceof Error ? error.message : 'Unknown error'}`
    result.errors.push(errorMsg)
    console.error(`[GameSync] ${errorMsg}`)
  } finally {
    result.duration = Date.now() - startTime
    logSyncResult(`Games:${sport}`, result)
  }

  return result
}

/**
 * Sync games for all supported sports
 */
export async function syncAllGames(): Promise<SyncResult> {
  return withLock('sync-games', async () => {
    const startTime = Date.now()
    const aggregateResult = createSyncResult()

    console.log('[GameSync] Starting game sync for all sports...')

    // Sync each sport sequentially to manage API quota
    for (const sport of Object.keys(SPORT_KEYS)) {
      const result = await syncGamesForSport(sport)

      // Aggregate results
      aggregateResult.itemsProcessed += result.itemsProcessed
      aggregateResult.itemsCreated += result.itemsCreated
      aggregateResult.itemsUpdated += result.itemsUpdated
      aggregateResult.itemsSkipped += result.itemsSkipped
      aggregateResult.errors.push(...result.errors)

      if (!result.success) {
        aggregateResult.success = false
      }
    }

    aggregateResult.duration = Date.now() - startTime
    logSyncResult('Games:All', aggregateResult)

    return aggregateResult
  }) || createSyncResult() // Return empty result if lock not acquired
}

/**
 * Update game status (SCHEDULED -> LIVE -> FINAL)
 * This would integrate with a live scores API in production
 */
export async function updateGameStatuses(): Promise<SyncResult> {
  const startTime = Date.now()
  const result = createSyncResult()

  try {
    const now = new Date()

    // Find games that should be LIVE (started within last 4 hours, not marked FINAL)
    const potentiallyLiveGames = await prisma.game.findMany({
      where: {
        startTime: {
          lte: now,
          gte: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        },
        status: {
          not: 'FINAL',
        },
      },
    })

    for (const game of potentiallyLiveGames) {
      const hoursElapsed = (now.getTime() - game.startTime.getTime()) / (1000 * 60 * 60)

      let newStatus = game.status

      if (hoursElapsed >= 4) {
        // Assume game finished after 4 hours
        newStatus = 'FINAL'
      } else if (hoursElapsed >= 0) {
        // Game has started
        newStatus = 'LIVE'
      }

      if (newStatus !== game.status) {
        await prisma.game.update({
          where: { id: game.id },
          data: { status: newStatus },
        })
        result.itemsUpdated++
      }

      result.itemsProcessed++
    }

    result.success = true
  } catch (error) {
    result.success = false
    result.errors.push(
      `Status update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  } finally {
    result.duration = Date.now() - startTime
    logSyncResult('Games:Status', result)
  }

  return result
}

/**
 * Cleanup old games outside the historical window
 */
export async function cleanupOldGames(): Promise<SyncResult> {
  const startTime = Date.now()
  const result = createSyncResult()

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30) // Keep 30 days of history

    const deleteResult = await prisma.game.deleteMany({
      where: {
        startTime: {
          lt: cutoffDate,
        },
        status: 'FINAL',
      },
    })

    result.itemsProcessed = deleteResult.count
    result.success = true

    console.log(`[GameSync] Cleaned up ${deleteResult.count} old games`)
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
