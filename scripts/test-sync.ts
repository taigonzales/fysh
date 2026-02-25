#!/usr/bin/env tsx
/**
 * Test sync process without writing to database
 * Validates API connectivity and data transformation
 *
 * Usage:
 *   pnpm tsx scripts/test-sync.ts
 */

// IMPORTANT: Load environment variables FIRST, before any other imports
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Now import everything else
import {
  oddsApiClient,
  transformGames,
  transformAllOdds,
  transformAllPlayerProps,
  SPORT_KEYS,
  getRateLimitInfo,
} from '../lib/api/odds-api'

async function main() {
  console.log('='.repeat(60))
  console.log('🧪 Testing Odds API Integration...')
  console.log('='.repeat(60))

  if (!process.env.ODDS_API_KEY) {
    console.error('\n❌ Error: ODDS_API_KEY not set in environment')
    console.log('   Please add it to your .env.local file')
    process.exit(1)
  }

  try {
    // Test 1: Fetch sports list (free endpoint)
    console.log('\n📋 Test 1: Fetching sports list...')
    const sports = await oddsApiClient.getSports()
    console.log(`   ✅ Found ${sports.length} sports`)

    const activeSports = sports.filter((s) => s.active)
    console.log(`   ✅ ${activeSports.length} active sports`)

    // Test 2: Fetch NBA games (schedules only - minimal quota usage)
    console.log('\n🏀 Test 2: Fetching NBA games...')
    const nbaEvents = await oddsApiClient.getEvents('basketball_nba')
    console.log(`   ✅ Found ${nbaEvents.length} NBA games`)

    if (nbaEvents.length > 0) {
      const firstGame = nbaEvents[0]
      console.log(`   Example: ${firstGame?.away_team} @ ${firstGame?.home_team}`)
      console.log(`   Starts: ${firstGame?.commence_time ? new Date(firstGame.commence_time).toLocaleString() : 'N/A'}`)

      // Test transformation
      console.log('\n🔄 Test 3: Testing data transformation...')
      const games = transformGames(nbaEvents)
      console.log(`   ✅ Transformed ${games.length} games`)

      const exampleGame = games[0]
      console.log(`   Example transformed:`)
      console.log(`     - Sport: ${exampleGame?.sport}`)
      console.log(`     - Teams: ${exampleGame?.awayTeamAbbr} @ ${exampleGame?.homeTeamAbbr}`)
      console.log(`     - Season: ${exampleGame?.season}`)
    }

    // Test 3: Fetch odds for one game (will consume quota)
    if (nbaEvents.length > 0) {
      console.log('\n💰 Test 4: Fetching odds for first game...')
      console.log('   ⚠️  This will consume API quota')

      const firstEvent = nbaEvents[0]
      const oddsEvent = await oddsApiClient.getEventOdds('basketball_nba', firstEvent!.id, {
        markets: ['h2h', 'spreads', 'totals'],
        includeLinks: true, // Test QuickSlip integration
      })

      if (oddsEvent.bookmakers && oddsEvent.bookmakers.length > 0) {
        console.log(`   ✅ Found odds from ${oddsEvent.bookmakers.length} bookmakers`)

        const odds = transformAllOdds([oddsEvent])
        console.log(`   ✅ Transformed ${odds.length} odds`)

        // Check for QuickSlip deep links
        const oddsWithLinks = odds.filter((o) => o.deeplinkUrl)
        if (oddsWithLinks.length > 0) {
          console.log(`   ✅ Found ${oddsWithLinks.length} odds with QuickSlip deep links`)
          console.log(`   Example link: ${oddsWithLinks[0]?.deeplinkUrl}`)
        } else {
          console.log('   ℹ️  No QuickSlip deep links found (may not be available for this game)')
        }
      } else {
        console.log('   ⚠️  No bookmaker odds available for this game')
      }
    }

    // Check rate limit
    const rateLimitInfo = getRateLimitInfo()
    console.log('\n📊 API Quota:')
    console.log(`   Remaining: ${rateLimitInfo.requestsRemaining}`)
    console.log(`   Used: ${rateLimitInfo.requestsUsed}`)

    if (rateLimitInfo.requestsRemaining < 50) {
      console.warn('\n⚠️  Warning: Low API quota remaining!')
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ All tests passed!')
    console.log('='.repeat(60))
    console.log('\nNext steps:')
    console.log('  1. Run database seed: pnpm db:seed')
    console.log('  2. Start the development server: pnpm dev')
    console.log('  3. Trigger initial odds sync (optional): pnpm seed:odds')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Test failed:', error)

    if (error instanceof Error) {
      console.error('\nError details:', error.message)

      if (error.message.includes('401')) {
        console.error('\n💡 Tip: Check that your ODDS_API_KEY is correct')
      } else if (error.message.includes('429')) {
        console.error('\n💡 Tip: API rate limit exceeded. Wait and try again.')
      }
    }

    process.exit(1)
  }
}

main()
