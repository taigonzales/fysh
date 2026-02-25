#!/usr/bin/env tsx
/**
 * Quick test to see if odds are available from the API
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { oddsApiClient, SPORT_KEYS, DEFAULT_MARKETS } from '../lib/api/odds-api'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing if odds are available from API...\n')

  try {
    // Get a sample game from database
    const sampleGame = await prisma.game.findFirst({
      where: {
        sport: 'NBA',
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    if (!sampleGame) {
      console.log('❌ No NBA games found in database')
      process.exit(1)
    }

    console.log(`📅 Sample game:`)
    console.log(`   ${sampleGame.awayTeam} @ ${sampleGame.homeTeam}`)
    console.log(`   External ID: ${sampleGame.externalId}`)
    console.log(`   Start: ${sampleGame.startTime.toLocaleString()}\n`)

    // Fetch odds for NBA
    console.log('💰 Fetching NBA odds from API...')
    const events = await oddsApiClient.getOdds({
      sport: SPORT_KEYS.NBA!,
      markets: DEFAULT_MARKETS,
      includeLinks: true,
    })

    console.log(`\n✅ API returned ${events.length} events with odds`)

    if (events.length > 0) {
      const firstEvent = events[0]
      console.log(`\n📋 First event:`)
      console.log(`   ID: ${firstEvent?.id}`)
      console.log(`   ${firstEvent?.away_team} @ ${firstEvent?.home_team}`)
      console.log(`   Bookmakers: ${firstEvent?.bookmakers?.length || 0}`)

      if (firstEvent?.bookmakers && firstEvent.bookmakers.length > 0) {
        const firstBookmaker = firstEvent.bookmakers[0]
        console.log(`   First bookmaker: ${firstBookmaker?.key}`)
        console.log(`   Markets: ${firstBookmaker?.markets?.length || 0}`)
      }

      // Check if our sample game is in the response
      const matchingEvent = events.find(e => e.id === sampleGame.externalId)
      if (matchingEvent) {
        console.log(`\n✅ Found our sample game in API response!`)
        console.log(`   Bookmakers with odds: ${matchingEvent.bookmakers?.length || 0}`)
      } else {
        console.log(`\n⚠️  Our sample game not found in API response`)
        console.log(`   This might mean odds aren't available for this game yet`)
      }
    } else {
      console.log('\n⚠️  No events with odds returned from API')
      console.log('   This could mean:')
      console.log('   - No games are currently available with odds')
      console.log('   - Odds might only be available closer to game time')
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('\n❌ Error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
