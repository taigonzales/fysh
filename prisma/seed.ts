/**
 * Database seeder - populate initial data
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { runGamesSync } from '../lib/services/sync'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Seed games for the next 24 hours
    console.log('\n📅 Seeding games...')
    const gamesResult = await runGamesSync()

    console.log(`\n✅ Games seeded:`)
    console.log(`   - Created: ${gamesResult.games?.itemsCreated || 0}`)
    console.log(`   - Updated: ${gamesResult.games?.itemsUpdated || 0}`)
    console.log(`   - API quota remaining: ${gamesResult.rateLimitInfo.requestsRemaining}`)

    // Note: We don't seed odds/props here to conserve API quota
    // Use scripts/seed-odds.ts for initial odds/props backfill

    console.log('\n🎉 Seed completed successfully!')
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
