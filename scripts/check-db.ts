#!/usr/bin/env tsx
/**
 * Quick script to check what's in the database
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking database contents...\n')

  // Count games
  const gamesCount = await prisma.game.count()
  console.log(`📅 Games: ${gamesCount}`)

  // Count odds
  const oddsCount = await prisma.odds.count()
  console.log(`💰 Odds: ${oddsCount}`)

  // Count props
  const propsCount = await prisma.playerProp.count()
  console.log(`🎯 Player Props: ${propsCount}`)

  if (gamesCount > 0) {
    // Show sample games
    const sampleGames = await prisma.game.findMany({
      take: 5,
      orderBy: { startTime: 'asc' },
      select: {
        sport: true,
        homeTeam: true,
        awayTeam: true,
        startTime: true,
        _count: {
          select: {
            odds: true,
            props: true,
          },
        },
      },
    })

    console.log('\n📋 Sample games:')
    sampleGames.forEach((game) => {
      console.log(`   ${game.sport}: ${game.awayTeam} @ ${game.homeTeam}`)
      console.log(`      Start: ${game.startTime.toLocaleString()}`)
      console.log(`      Odds: ${game._count.odds}, Props: ${game._count.props}`)
    })
  }

  await prisma.$disconnect()
}

main()
