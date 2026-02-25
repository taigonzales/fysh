/**
 * Player props synchronization service
 * Fetches and stores player props for priority games
 */

import { PrismaClient } from '@prisma/client'
import {
  oddsApiClient,
  SPORT_KEYS,
  PLAYER_PROP_MARKETS,
  transformAllPlayerProps,
  hasRateLimitQuota,
} from '@/lib/api/odds-api'
import {
  calculateGamePriority,
  prioritizeGames,
  createSyncResult,
  logSyncResult,
  withLock,
  type SyncResult,
} from './utils'

const prisma = new PrismaClient()

// ============================================
// Player Props Sync
// ============================================

/**
 * Sync player props for high-priority games
 * Props consume significant API quota, so we only fetch for important games
 */
export async function syncPriorityPlayerProps(): Promise<SyncResult> {
  const lockResult = await withLock('sync-props', async () => {
    const startTime = Date.now()
    const result = createSyncResult()

    try {
      console.log('[PropsSync] Starting priority player props sync...')

      // Get upcoming games
      const upcomingGames = await prisma.game.findMany({
        where: {
          status: 'SCHEDULED',
          startTime: {
            gte: new Date(),
            lte: new Date(Date.now() + 48 * 60 * 60 * 1000), // Next 48 hours
          },
        },
        include: {
          props: {
            orderBy: {
              fetchedAt: 'desc',
            },
            take: 1,
          },
        },
      })

      // Prioritize games - only fetch props for HIGH and MEDIUM priority
      const prioritizedGames = prioritizeGames(upcomingGames).filter((game) => {
        const priority = calculateGamePriority(game)
        return priority === 'HIGH' || priority === 'MEDIUM'
      })

      console.log(
        `[PropsSync] Found ${prioritizedGames.length} priority games for props (from ${upcomingGames.length} total)`
      )

      // Limit to top games to conserve quota
      const gamesToSync = prioritizedGames.slice(0, 10)

      for (const game of gamesToSync) {
        // Check quota before each request
        if (!hasRateLimitQuota(5)) {
          console.warn('[PropsSync] Stopping due to low API quota')
          result.errors.push('Low API quota - sync incomplete')
          break
        }

        const sportKey = SPORT_KEYS[game.sport]
        if (!sportKey) continue

        const propMarkets = PLAYER_PROP_MARKETS[game.sport]
        if (!propMarkets || propMarkets.length === 0) {
          console.log(`[PropsSync] No prop markets configured for ${game.sport}`)
          result.itemsSkipped++
          continue
        }

        console.log(
          `[PropsSync] Syncing props for ${game.sport} - ${game.awayTeam} @ ${game.homeTeam}`
        )

        try {
          // Fetch player props
          const event = await oddsApiClient.getPlayerProps({
            sport: sportKey,
            eventId: game.externalId,
            markets: propMarkets,
            includeLinks: true, // Enable QuickSlip deep links
          })

          const props = transformAllPlayerProps([event])

          console.log(`[PropsSync] Found ${props.length} props for game ${game.id}`)

          // Delete existing props for this game to avoid duplicates
          // (Alternative: upsert logic based on player/propType/sportsbook)
          await prisma.playerProp.deleteMany({
            where: {
              gameId: game.id,
              fetchedAt: {
                lt: new Date(Date.now() - 60 * 60 * 1000), // Keep only props < 1 hour old
              },
            },
          })

          // Store new props
          for (const prop of props) {
            await prisma.playerProp.create({
              data: {
                gameId: game.id,
                playerName: prop.playerName,
                playerTeam: prop.playerTeam,
                propType: prop.propType,
                line: prop.line,
                overOdds: prop.overOdds,
                underOdds: prop.underOdds,
                sportsbook: prop.sportsbook,
                fetchedAt: prop.fetchedAt,
                // QuickSlip fields
                bookmakerEventId: prop.bookmakerEventId,
                bookmakerMarketId: prop.bookmakerMarketId,
                bookmakerSelectionId: prop.bookmakerSelectionId,
                deeplinkUrl: prop.deeplinkUrl,
              },
            })
          }

          result.itemsCreated += props.length
          result.itemsProcessed++
        } catch (error) {
          result.errors.push(
            `Failed to sync props for game ${game.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      }

      result.success = result.errors.length === 0
    } catch (error) {
      result.success = false
      result.errors.push(
        `Props sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      result.duration = Date.now() - startTime
      logSyncResult('Props:Priority', result)
    }

    return result
  })

  return lockResult || createSyncResult()
}

/**
 * Sync props for a specific game
 */
export async function syncPropsForGame(gameId: string): Promise<SyncResult> {
  const startTime = Date.now()
  const result = createSyncResult()

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      result.success = false
      result.errors.push('Game not found')
      return result
    }

    const sportKey = SPORT_KEYS[game.sport]
    const propMarkets = PLAYER_PROP_MARKETS[game.sport]

    if (!sportKey || !propMarkets || propMarkets.length === 0) {
      result.success = false
      result.errors.push(`No prop markets for sport: ${game.sport}`)
      return result
    }

    console.log(
      `[PropsSync] Fetching props for ${game.sport} - ${game.awayTeam} @ ${game.homeTeam}`
    )

    const event = await oddsApiClient.getPlayerProps({
      sport: sportKey,
      eventId: game.externalId,
      markets: propMarkets,
      includeLinks: true,
    })

    const props = transformAllPlayerProps([event])

    // Delete old props
    await prisma.playerProp.deleteMany({
      where: { gameId },
    })

    // Store new props
    for (const prop of props) {
      await prisma.playerProp.create({
        data: {
          gameId,
          playerName: prop.playerName,
          playerTeam: prop.playerTeam,
          propType: prop.propType,
          line: prop.line,
          overOdds: prop.overOdds,
          underOdds: prop.underOdds,
          sportsbook: prop.sportsbook,
          fetchedAt: prop.fetchedAt,
          bookmakerEventId: prop.bookmakerEventId,
          bookmakerMarketId: prop.bookmakerMarketId,
          bookmakerSelectionId: prop.bookmakerSelectionId,
          deeplinkUrl: prop.deeplinkUrl,
        },
      })
    }

    result.itemsCreated = props.length
    result.itemsProcessed = 1
    result.success = true
  } catch (error) {
    result.success = false
    result.errors.push(
      `Props sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  } finally {
    result.duration = Date.now() - startTime
    logSyncResult(`Props:Game:${gameId}`, result)
  }

  return result
}

/**
 * Search player props
 */
export async function searchPlayerProps(params: {
  playerName?: string
  propType?: string
  gameId?: string
  sport?: string
  minLine?: number
  maxLine?: number
}) {
  const where: any = {}

  if (params.playerName) {
    where.playerName = {
      contains: params.playerName,
      mode: 'insensitive',
    }
  }

  if (params.propType) {
    where.propType = params.propType
  }

  if (params.gameId) {
    where.gameId = params.gameId
  }

  if (params.sport) {
    where.game = {
      sport: params.sport,
    }
  }

  if (params.minLine !== undefined || params.maxLine !== undefined) {
    where.line = {}
    if (params.minLine !== undefined) {
      where.line.gte = params.minLine
    }
    if (params.maxLine !== undefined) {
      where.line.lte = params.maxLine
    }
  }

  return prisma.playerProp.findMany({
    where,
    include: {
      game: true,
    },
    orderBy: {
      fetchedAt: 'desc',
    },
  })
}

/**
 * Cleanup old player props
 */
export async function cleanupOldProps(): Promise<SyncResult> {
  const startTime = Date.now()
  const result = createSyncResult()

  try {
    // Keep only props from last 48 hours
    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const deleteResult = await prisma.playerProp.deleteMany({
      where: {
        fetchedAt: {
          lt: cutoffDate,
        },
      },
    })

    result.itemsProcessed = deleteResult.count
    result.success = true

    console.log(`[PropsSync] Cleaned up ${deleteResult.count} old props`)
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
