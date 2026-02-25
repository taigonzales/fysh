/**
 * Sync scheduler - orchestrates all sync operations
 */

import { syncAllGames, updateGameStatuses, cleanupOldGames } from './game-sync'
import { syncPriorityOdds, cleanupOldOdds } from './odds-sync'
import { syncPriorityPlayerProps, cleanupOldProps } from './props-sync'
import { getRateLimitInfo } from '@/lib/api/odds-api'
import type { SyncResult } from './utils'

// ============================================
// Scheduler
// ============================================

export interface SchedulerResult {
  timestamp: Date
  games?: SyncResult
  odds?: SyncResult
  props?: SyncResult
  rateLimitInfo: {
    requestsRemaining: number
    requestsUsed: number
  }
  totalDuration: number
}

/**
 * Full sync - runs all sync operations
 * This is the main entry point for scheduled jobs
 */
export async function runFullSync(): Promise<SchedulerResult> {
  const startTime = Date.now()

  console.log('='.repeat(60))
  console.log('🔄 Starting full sync...')
  console.log('='.repeat(60))

  const result: SchedulerResult = {
    timestamp: new Date(),
    rateLimitInfo: {
      requestsRemaining: 0,
      requestsUsed: 0,
    },
    totalDuration: 0,
  }

  try {
    // Step 1: Sync games (fetches schedules)
    console.log('\n📅 Step 1: Syncing games...')
    result.games = await syncAllGames()

    // Step 2: Update game statuses
    console.log('\n🔄 Step 2: Updating game statuses...')
    await updateGameStatuses()

    // Step 3: Sync odds for priority games
    console.log('\n💰 Step 3: Syncing priority odds...')
    result.odds = await syncPriorityOdds()

    // Step 4: Sync player props for top games
    console.log('\n🎯 Step 4: Syncing priority player props...')
    result.props = await syncPriorityPlayerProps()

    // Step 5: Get final rate limit info
    const rateLimitInfo = getRateLimitInfo()
    result.rateLimitInfo = {
      requestsRemaining: rateLimitInfo.requestsRemaining,
      requestsUsed: rateLimitInfo.requestsUsed,
    }

    console.log('\n📊 Sync Summary:')
    console.log(`   Games: ${result.games?.itemsCreated || 0} created, ${result.games?.itemsUpdated || 0} updated`)
    console.log(`   Odds: ${result.odds?.itemsCreated || 0} created`)
    console.log(`   Props: ${result.props?.itemsCreated || 0} created`)
    console.log(`   API Quota: ${result.rateLimitInfo.requestsRemaining} remaining`)
  } catch (error) {
    console.error('❌ Full sync failed:', error)
  }

  result.totalDuration = Date.now() - startTime

  console.log(`\n✅ Full sync completed in ${(result.totalDuration / 1000).toFixed(2)}s`)
  console.log('='.repeat(60))

  return result
}

/**
 * Quick sync - only odds and props (for frequent updates)
 * Use this for 15-minute cron jobs
 */
export async function runQuickSync(): Promise<SchedulerResult> {
  const startTime = Date.now()

  console.log('='.repeat(60))
  console.log('⚡ Starting quick sync (odds + props)...')
  console.log('='.repeat(60))

  const result: SchedulerResult = {
    timestamp: new Date(),
    rateLimitInfo: {
      requestsRemaining: 0,
      requestsUsed: 0,
    },
    totalDuration: 0,
  }

  try {
    // Sync odds
    console.log('\n💰 Syncing priority odds...')
    result.odds = await syncPriorityOdds()

    // Sync props (less frequently)
    const minute = new Date().getMinutes()
    if (minute % 30 === 0) {
      // Every 30 minutes
      console.log('\n🎯 Syncing priority props...')
      result.props = await syncPriorityPlayerProps()
    }

    // Update game statuses
    await updateGameStatuses()

    const rateLimitInfo = getRateLimitInfo()
    result.rateLimitInfo = {
      requestsRemaining: rateLimitInfo.requestsRemaining,
      requestsUsed: rateLimitInfo.requestsUsed,
    }

    console.log('\n📊 Quick Sync Summary:')
    console.log(`   Odds: ${result.odds?.itemsCreated || 0} created`)
    if (result.props) {
      console.log(`   Props: ${result.props.itemsCreated} created`)
    }
    console.log(`   API Quota: ${result.rateLimitInfo.requestsRemaining} remaining`)
  } catch (error) {
    console.error('❌ Quick sync failed:', error)
  }

  result.totalDuration = Date.now() - startTime

  console.log(`\n✅ Quick sync completed in ${(result.totalDuration / 1000).toFixed(2)}s`)
  console.log('='.repeat(60))

  return result
}

/**
 * Cleanup sync - removes old data
 * Run this daily to keep database size manageable
 */
export async function runCleanupSync(): Promise<SchedulerResult> {
  const startTime = Date.now()

  console.log('='.repeat(60))
  console.log('🧹 Starting cleanup sync...')
  console.log('='.repeat(60))

  const result: SchedulerResult = {
    timestamp: new Date(),
    rateLimitInfo: getRateLimitInfo(),
    totalDuration: 0,
  }

  try {
    console.log('\n🗑️  Cleaning up old games...')
    await cleanupOldGames()

    console.log('\n🗑️  Cleaning up old odds...')
    await cleanupOldOdds()

    console.log('\n🗑️  Cleaning up old props...')
    await cleanupOldProps()

    console.log('\n✅ Cleanup completed')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }

  result.totalDuration = Date.now() - startTime

  console.log(`\n⏱️  Cleanup took ${(result.totalDuration / 1000).toFixed(2)}s`)
  console.log('='.repeat(60))

  return result
}

/**
 * Games-only sync
 * Use this for the 6-hour game sync cron job
 */
export async function runGamesSync(): Promise<SchedulerResult> {
  const startTime = Date.now()

  console.log('='.repeat(60))
  console.log('📅 Starting games sync...')
  console.log('='.repeat(60))

  const result: SchedulerResult = {
    timestamp: new Date(),
    rateLimitInfo: {
      requestsRemaining: 0,
      requestsUsed: 0,
    },
    totalDuration: 0,
  }

  try {
    result.games = await syncAllGames()
    await updateGameStatuses()

    const rateLimitInfo = getRateLimitInfo()
    result.rateLimitInfo = {
      requestsRemaining: rateLimitInfo.requestsRemaining,
      requestsUsed: rateLimitInfo.requestsUsed,
    }

    console.log('\n📊 Games Sync Summary:')
    console.log(`   Created: ${result.games.itemsCreated}`)
    console.log(`   Updated: ${result.games.itemsUpdated}`)
    console.log(`   API Quota: ${result.rateLimitInfo.requestsRemaining} remaining`)
  } catch (error) {
    console.error('❌ Games sync failed:', error)
  }

  result.totalDuration = Date.now() - startTime

  console.log(`\n✅ Games sync completed in ${(result.totalDuration / 1000).toFixed(2)}s`)
  console.log('='.repeat(60))

  return result
}

/**
 * Odds-only sync
 * Use this for the 15-minute odds sync cron job
 */
export async function runOddsSync(): Promise<SchedulerResult> {
  const startTime = Date.now()

  console.log('='.repeat(60))
  console.log('💰 Starting odds sync...')
  console.log('='.repeat(60))

  const result: SchedulerResult = {
    timestamp: new Date(),
    rateLimitInfo: {
      requestsRemaining: 0,
      requestsUsed: 0,
    },
    totalDuration: 0,
  }

  try {
    result.odds = await syncPriorityOdds()

    const rateLimitInfo = getRateLimitInfo()
    result.rateLimitInfo = {
      requestsRemaining: rateLimitInfo.requestsRemaining,
      requestsUsed: rateLimitInfo.requestsUsed,
    }

    console.log('\n📊 Odds Sync Summary:')
    console.log(`   Created: ${result.odds.itemsCreated}`)
    console.log(`   API Quota: ${result.rateLimitInfo.requestsRemaining} remaining`)
  } catch (error) {
    console.error('❌ Odds sync failed:', error)
  }

  result.totalDuration = Date.now() - startTime

  console.log(`\n✅ Odds sync completed in ${(result.totalDuration / 1000).toFixed(2)}s`)
  console.log('='.repeat(60))

  return result
}

/**
 * Props-only sync
 * Use this for the 30-minute props sync cron job
 */
export async function runPropsSync(): Promise<SchedulerResult> {
  const startTime = Date.now()

  console.log('='.repeat(60))
  console.log('🎯 Starting props sync...')
  console.log('='.repeat(60))

  const result: SchedulerResult = {
    timestamp: new Date(),
    rateLimitInfo: {
      requestsRemaining: 0,
      requestsUsed: 0,
    },
    totalDuration: 0,
  }

  try {
    result.props = await syncPriorityPlayerProps()

    const rateLimitInfo = getRateLimitInfo()
    result.rateLimitInfo = {
      requestsRemaining: rateLimitInfo.requestsRemaining,
      requestsUsed: rateLimitInfo.requestsUsed,
    }

    console.log('\n📊 Props Sync Summary:')
    console.log(`   Created: ${result.props.itemsCreated}`)
    console.log(`   API Quota: ${result.rateLimitInfo.requestsRemaining} remaining`)
  } catch (error) {
    console.error('❌ Props sync failed:', error)
  }

  result.totalDuration = Date.now() - startTime

  console.log(`\n✅ Props sync completed in ${(result.totalDuration / 1000).toFixed(2)}s`)
  console.log('='.repeat(60))

  return result
}
