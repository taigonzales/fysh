#!/usr/bin/env tsx
/**
 * Test getEventOdds to see why backfill isn't working
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { oddsApiClient, SPORT_KEYS, DEFAULT_MARKETS, transformAllOdds } from '../lib/api/odds-api'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing getEventOdds API call...\n')

  try {
    // Get a sample NBA game
    const game = await prisma.game.findFirst({
      where: {
        sport: 'NBA',
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    if (!game) {
      console.log('❌ No NBA games found')
      process.exit(1)
    }

    console.log(`📅 Testing with game:`)
    console.log(`   ${game.awayTeam} @ ${game.homeTeam}`)
    console.log(`   External ID: ${game.externalId}`)
    console.log(`   Start: ${game.startTime.toLocaleString()}\n`)

    console.log('💰 Calling getEventOdds...')

    try {
      const event = await oddsApiClient.getEventOdds(
        SPORT_KEYS.NBA,
        game.externalId,
        {
          markets: DEFAULT_MARKETS,
          includeLinks: true,
        }
      )

      console.log('\n✅ getEventOdds succeeded!')
      console.log(`   Event ID: ${event.id}`)
      console.log(`   ${event.away_team} @ ${event.home_team}`)
      console.log(`   Bookmakers: ${event.bookmakers?.length || 0}`)

      if (event.bookmakers && event.bookmakers.length > 0) {
        const odds = transformAllOdds([event])
        console.log(`\n📊 Transformed odds:`)
        console.log(`   Total odds: ${odds.length}`)
        console.log(`   Sportsbooks: ${[...new Set(odds.map(o => o.sportsbook))].join(', ')}`)
        console.log(`   Markets: ${[...new Set(odds.map(o => o.marketType))].join(', ')}`)

        // Try to create one in the database
        console.log(`\n💾 Testing database insert...`)
        const testOdds = odds[0]
        await prisma.odds.create({
          data: {
            gameId: game.id,
            sportsbook: testOdds.sportsbook,
            marketType: testOdds.marketType,
            homeLine: testOdds.homeLine,
            awayLine: testOdds.awayLine,
            homeOdds: testOdds.homeOdds,
            awayOdds: testOdds.awayOdds,
            overUnder: testOdds.overUnder,
            overOdds: testOdds.overOdds,
            underOdds: testOdds.underOdds,
            fetchedAt: testOdds.fetchedAt,
            bookmakerEventId: testOdds.bookmakerEventId,
            bookmakerMarketId: testOdds.bookmakerMarketId,
            bookmakerSelectionId: testOdds.bookmakerSelectionId,
            deeplinkUrl: testOdds.deeplinkUrl,
          },
        })
        console.log(`   ✅ Successfully inserted 1 odds record!`)
      }
    } catch (error) {
      console.error('\n❌ getEventOdds failed:')
      console.error(error)
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('\n❌ Error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
