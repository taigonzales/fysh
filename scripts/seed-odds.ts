#!/usr/bin/env tsx
/**
 * One-time backfill script for odds and props
 * This populates initial data to get the platform running
 *
 * Usage:
 *   pnpm tsx scripts/seed-odds.ts
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { runOddsSync, runPropsSync } from '../lib/services/sync'
import { getRateLimitInfo } from '../lib/api/odds-api'

async function main() {
  console.log('='.repeat(60))
  console.log('🌱 Starting odds & props backfill...')
  console.log('='.repeat(60))

  try {
    // Check API quota before starting
    const initialQuota = getRateLimitInfo()
    console.log(`\n📊 Initial API quota: ${initialQuota.requestsRemaining} requests remaining`)

    if (initialQuota.requestsRemaining < 50) {
      console.warn('\n⚠️  Low API quota! Consider waiting or using a different key.')
      console.warn('   This script will consume significant quota.')

      // Wait for user confirmation
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      const answer = await new Promise<string>((resolve) => {
        readline.question('\nContinue anyway? (y/n): ', resolve)
      })

      readline.close()

      if (answer.toLowerCase() !== 'y') {
        console.log('\n❌ Aborted by user')
        process.exit(0)
      }
    }

    // Seed odds
    console.log('\n💰 Step 1: Syncing odds for priority games...')
    const oddsResult = await runOddsSync()

    console.log(`\n✅ Odds synced:`)
    console.log(`   - Games processed: ${oddsResult.odds?.itemsProcessed || 0}`)
    console.log(`   - Odds created: ${oddsResult.odds?.itemsCreated || 0}`)
    console.log(`   - Duration: ${(oddsResult.totalDuration / 1000).toFixed(2)}s`)

    // Check quota after odds sync
    const midQuota = getRateLimitInfo()
    console.log(`\n📊 API quota after odds: ${midQuota.requestsRemaining} requests remaining`)

    if (midQuota.requestsRemaining < 10) {
      console.warn('\n⚠️  API quota too low to continue with props sync')
      console.log('   You can run this script again later to sync props')
      process.exit(0)
    }

    // Seed props
    console.log('\n🎯 Step 2: Syncing props for top games...')
    const propsResult = await runPropsSync()

    console.log(`\n✅ Props synced:`)
    console.log(`   - Games processed: ${propsResult.props?.itemsProcessed || 0}`)
    console.log(`   - Props created: ${propsResult.props?.itemsCreated || 0}`)
    console.log(`   - Duration: ${(propsResult.totalDuration / 1000).toFixed(2)}s`)

    // Final quota check
    const finalQuota = getRateLimitInfo()

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Backfill complete!')
    console.log('='.repeat(60))
    console.log(`\n📊 Final API quota: ${finalQuota.requestsRemaining} requests remaining`)
    console.log(`   Used: ${initialQuota.requestsRemaining - finalQuota.requestsRemaining} requests`)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Backfill failed:', error)
    process.exit(1)
  }
}

main()
