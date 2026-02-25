/**
 * Shared utilities for sync services
 */

import type { Sport, Game } from '@prisma/client'
import { SYNC_CONFIG } from '@/lib/api/odds-api'

// ============================================
// Time Window Helpers
// ============================================

/**
 * Get date range for upcoming games sync
 */
export function getUpcomingGamesWindow(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getTime() - SYNC_CONFIG.RECENT_WINDOW_HOURS * 60 * 60 * 1000)
  const end = new Date(now.getTime() + SYNC_CONFIG.UPCOMING_WINDOW_HOURS * 60 * 60 * 1000)

  return { start, end }
}

/**
 * Get date for historical games cleanup
 */
export function getHistoricalCutoffDate(): Date {
  const now = new Date()
  return new Date(now.getTime() - SYNC_CONFIG.GAME_HISTORY_DAYS * 24 * 60 * 60 * 1000)
}

/**
 * Calculate hours until game starts
 */
export function getHoursUntilStart(game: Game): number {
  const now = new Date()
  const startTime = new Date(game.startTime)
  return (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
}

/**
 * Check if game is within upcoming window
 */
export function isWithinUpcomingWindow(game: Game): boolean {
  const hoursUntil = getHoursUntilStart(game)
  return hoursUntil > 0 && hoursUntil <= SYNC_CONFIG.UPCOMING_WINDOW_HOURS
}

/**
 * Check if data is stale based on fetchedAt timestamp
 */
export function isDataStale(fetchedAt: Date, maxAgeMinutes: number): boolean {
  const now = new Date()
  const ageMinutes = (now.getTime() - fetchedAt.getTime()) / (1000 * 60)
  return ageMinutes > maxAgeMinutes
}

// ============================================
// Priority Calculation
// ============================================

export type GamePriority = 'HIGH' | 'MEDIUM' | 'LOW'

/**
 * Calculate game priority based on time until start
 */
export function calculateGamePriority(game: Game): GamePriority {
  const hoursUntil = getHoursUntilStart(game)

  if (hoursUntil < 0) {
    // Game has started or finished
    return 'LOW'
  }

  if (hoursUntil <= SYNC_CONFIG.HIGH_PRIORITY_THRESHOLD) {
    return 'HIGH'
  }

  if (hoursUntil <= SYNC_CONFIG.MEDIUM_PRIORITY_THRESHOLD) {
    return 'MEDIUM'
  }

  return 'LOW'
}

/**
 * Get refresh interval based on game priority (in minutes)
 */
export function getRefreshInterval(priority: GamePriority): number {
  switch (priority) {
    case 'HIGH':
      return 5 // Every 5 minutes for games starting soon
    case 'MEDIUM':
      return 15 // Every 15 minutes for games in next 24h
    case 'LOW':
      return 60 // Every hour for games further out
  }
}

/**
 * Calculate sport priority (for resource allocation)
 */
export function getSportPriority(sport: Sport): number {
  const priorities: Record<Sport, number> = {
    NBA: 5,
    NFL: 5,
    MLB: 4,
    NHL: 3,
    NCAAB: 2,
    NCAAF: 2,
  }
  return priorities[sport] || 1
}

/**
 * Filter and sort games by priority
 */
export function prioritizeGames(games: Game[]): Game[] {
  return games
    .map((game) => ({
      game,
      priority: calculateGamePriority(game),
      sportPriority: getSportPriority(game.sport),
      hoursUntil: getHoursUntilStart(game),
    }))
    .sort((a, b) => {
      // Sort by priority first (HIGH > MEDIUM > LOW)
      if (a.priority !== b.priority) {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }

      // Then by sport priority
      if (a.sportPriority !== b.sportPriority) {
        return b.sportPriority - a.sportPriority
      }

      // Finally by time until start (sooner first)
      return a.hoursUntil - b.hoursUntil
    })
    .map((item) => item.game)
}

// ============================================
// Mutex Lock (Simple In-Memory)
// ============================================

const locks = new Map<string, boolean>()

/**
 * Acquire a lock for a sync operation
 */
export async function acquireLock(key: string): Promise<boolean> {
  if (locks.get(key)) {
    return false // Already locked
  }

  locks.set(key, true)
  return true
}

/**
 * Release a lock
 */
export function releaseLock(key: string): void {
  locks.delete(key)
}

/**
 * Execute function with lock
 */
export async function withLock<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T | null> {
  const acquired = await acquireLock(key)

  if (!acquired) {
    console.warn(`[Sync] Lock already held: ${key}`)
    return null
  }

  try {
    return await fn()
  } finally {
    releaseLock(key)
  }
}

// ============================================
// Logging Helpers
// ============================================

export interface SyncResult {
  success: boolean
  itemsProcessed: number
  itemsCreated: number
  itemsUpdated: number
  itemsSkipped: number
  errors: string[]
  duration: number
  timestamp: Date
}

export function createSyncResult(): SyncResult {
  return {
    success: true,
    itemsProcessed: 0,
    itemsCreated: 0,
    itemsUpdated: 0,
    itemsSkipped: 0,
    errors: [],
    duration: 0,
    timestamp: new Date(),
  }
}

export function logSyncResult(operation: string, result: SyncResult): void {
  const level = result.success ? 'info' : 'error'
  const message = `[Sync:${operation}] ${result.itemsProcessed} processed, ${result.itemsCreated} created, ${result.itemsUpdated} updated, ${result.itemsSkipped} skipped in ${result.duration}ms`

  if (level === 'error' && result.errors.length > 0) {
    console.error(message, { errors: result.errors })
  } else {
    console.log(message)
  }
}

// ============================================
// Batch Processing
// ============================================

/**
 * Process items in batches with rate limiting
 */
export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processFn: (item: T) => Promise<R>,
  delayMs: number = 0
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    const batchResults = await Promise.allSettled(batch.map(processFn))

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        console.error('[Sync] Batch item failed:', result.reason)
      }
    }

    // Delay between batches
    if (delayMs > 0 && i + batchSize < items.length) {
      await sleep(delayMs)
    }
  }

  return results
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
