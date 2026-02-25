/**
 * Sync configuration - sport priorities, sync windows, schedules
 */

import type { Sport } from '@prisma/client'

// ============================================
// Sport Priorities
// ============================================

export const SPORT_PRIORITIES: Record<Sport, number> = {
  NBA: 5,
  NFL: 5,
  MLB: 4,
  NHL: 3,
  NCAAB: 2,
  NCAAF: 2,
}

/**
 * Get sport priority (higher = more important)
 */
export function getSportPriority(sport: Sport): number {
  return SPORT_PRIORITIES[sport] || 1
}

/**
 * Get sports sorted by priority
 */
export function getSportsByPriority(): Sport[] {
  return Object.entries(SPORT_PRIORITIES)
    .sort(([, a], [, b]) => b - a)
    .map(([sport]) => sport as Sport)
}

// ============================================
// Sync Windows
// ============================================

export const SYNC_WINDOWS = {
  // How far ahead to fetch games
  UPCOMING_GAMES_HOURS: 48,

  // How far back to keep recent data
  RECENT_GAMES_HOURS: 24,

  // Historical data retention
  GAME_HISTORY_DAYS: 7,
  ODDS_HISTORY_DAYS: 7,
  PROPS_HISTORY_DAYS: 2,

  // Priority thresholds (hours until game start)
  HIGH_PRIORITY_HOURS: 6, // < 6 hours = high priority
  MEDIUM_PRIORITY_HOURS: 24, // < 24 hours = medium priority
} as const

/**
 * Get upcoming games date range
 */
export function getUpcomingWindow() {
  const now = new Date()
  const start = new Date(now.getTime() - SYNC_WINDOWS.RECENT_GAMES_HOURS * 60 * 60 * 1000)
  const end = new Date(now.getTime() + SYNC_WINDOWS.UPCOMING_GAMES_HOURS * 60 * 60 * 1000)

  return { start, end }
}

/**
 * Get historical cutoff dates
 */
export function getHistoricalCutoffs() {
  const now = new Date()

  return {
    games: new Date(now.getTime() - SYNC_WINDOWS.GAME_HISTORY_DAYS * 24 * 60 * 60 * 1000),
    odds: new Date(now.getTime() - SYNC_WINDOWS.ODDS_HISTORY_DAYS * 24 * 60 * 60 * 1000),
    props: new Date(now.getTime() - SYNC_WINDOWS.PROPS_HISTORY_DAYS * 24 * 60 * 60 * 1000),
  }
}

// ============================================
// Sync Intervals
// ============================================

export const SYNC_INTERVALS = {
  // Scheduled sync frequencies (minutes)
  GAMES: 360, // Every 6 hours
  ODDS: 15, // Every 15 minutes
  PROPS: 30, // Every 30 minutes
  CLEANUP: 1440, // Daily

  // Dynamic intervals based on game priority
  DYNAMIC: {
    HIGH: 5, // Every 5 minutes for games starting soon
    MEDIUM: 15, // Every 15 minutes for games in next 24h
    LOW: 60, // Every hour for games further out
  },
} as const

/**
 * Get refresh interval for game priority
 */
export function getRefreshInterval(priority: 'HIGH' | 'MEDIUM' | 'LOW'): number {
  return SYNC_INTERVALS.DYNAMIC[priority]
}

// ============================================
// Batch Processing
// ============================================

export const BATCH_CONFIG = {
  // Batch sizes for bulk operations
  GAMES: 100,
  ODDS: 50,
  PROPS: 25,

  // Delay between batches (ms)
  DELAY_MS: 100,

  // Max concurrent operations
  MAX_CONCURRENT: 5,
} as const

// ============================================
// Sync Limits
// ============================================

export const SYNC_LIMITS = {
  // Max items to process per sync
  MAX_GAMES_PER_SYNC: 500,
  MAX_ODDS_PER_SYNC: 1000,
  MAX_PROPS_PER_SYNC: 500,

  // Max sync duration (ms)
  MAX_SYNC_DURATION: 5 * 60 * 1000, // 5 minutes

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
} as const

// ============================================
// Data Freshness
// ============================================

export const FRESHNESS_THRESHOLDS = {
  // Max age before data is considered stale (minutes)
  GAMES: 360, // 6 hours
  ODDS_DEFAULT: 30, // 30 minutes
  ODDS_HIGH_PRIORITY: 15, // 15 minutes for games starting soon
  PROPS: 60, // 1 hour
} as const

/**
 * Check if data is stale
 */
export function isDataStale(
  fetchedAt: Date,
  dataType: 'games' | 'odds' | 'props',
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
): boolean {
  const now = new Date()
  const ageMinutes = (now.getTime() - fetchedAt.getTime()) / (1000 * 60)

  let threshold: number

  switch (dataType) {
    case 'games':
      threshold = FRESHNESS_THRESHOLDS.GAMES
      break
    case 'odds':
      threshold =
        priority === 'HIGH'
          ? FRESHNESS_THRESHOLDS.ODDS_HIGH_PRIORITY
          : FRESHNESS_THRESHOLDS.ODDS_DEFAULT
      break
    case 'props':
      threshold = FRESHNESS_THRESHOLDS.PROPS
      break
  }

  return ageMinutes > threshold
}

// ============================================
// Season Calculation
// ============================================

/**
 * Get current season for a sport
 */
export function getCurrentSeason(sport: Sport): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12

  switch (sport) {
    case 'NBA':
    case 'NCAAB':
      // Basketball: October-April, season = start year
      return month >= 10 ? year.toString() : (year - 1).toString()

    case 'NFL':
    case 'NCAAF':
      // Football: August-February, season = start year
      return month >= 8 ? year.toString() : (year - 1).toString()

    case 'MLB':
      // Baseball: March-October, season = year
      return year.toString()

    case 'NHL':
      // Hockey: October-June, season = start year
      return month >= 10 ? year.toString() : (year - 1).toString()

    default:
      return year.toString()
  }
}

/**
 * Check if sport is currently in season
 */
export function isInSeason(sport: Sport): boolean {
  const month = new Date().getMonth() + 1

  switch (sport) {
    case 'NBA':
    case 'NCAAB':
      return month >= 10 || month <= 4
    case 'NFL':
    case 'NCAAF':
      return month >= 8 || month <= 2
    case 'MLB':
      return month >= 3 && month <= 10
    case 'NHL':
      return month >= 10 || month <= 6
    default:
      return true
  }
}

// ============================================
// Sync Strategy
// ============================================

/**
 * Determine sync strategy based on API quota
 */
export function getSyncStrategy(quotaRemaining: number): 'aggressive' | 'conservative' | 'minimal' {
  if (quotaRemaining > 100) return 'aggressive'
  if (quotaRemaining > 20) return 'conservative'
  return 'minimal'
}

/**
 * Get sports to sync based on quota
 */
export function getSportsToSync(quotaRemaining: number): Sport[] {
  const strategy = getSyncStrategy(quotaRemaining)
  const allSports = getSportsByPriority()

  switch (strategy) {
    case 'aggressive':
      return allSports
    case 'conservative':
      // Only sync in-season sports
      return allSports.filter(isInSeason)
    case 'minimal':
      // Only top 2 priority sports
      return allSports.slice(0, 2).filter(isInSeason)
  }
}
