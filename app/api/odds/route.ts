/**
 * GET /api/odds - Query and compare odds across sportsbooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const QuerySchema = z.object({
  gameId: z.string().optional(),
  sport: z.enum(['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB', 'NCAAF']).optional(),
  marketType: z.enum(['SPREAD', 'MONEYLINE', 'TOTAL']).optional(),
  sportsbook: z.string().optional(),
  minAge: z.string().optional().transform(Number), // Max age in minutes
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filter out null values before parsing
    const rawParams: any = {}
    const gameId = searchParams.get('gameId')
    const sport = searchParams.get('sport')
    const marketType = searchParams.get('marketType')
    const sportsbook = searchParams.get('sportsbook')
    const minAge = searchParams.get('minAge')

    if (gameId) rawParams.gameId = gameId
    if (sport) rawParams.sport = sport
    if (marketType) rawParams.marketType = marketType
    if (sportsbook) rawParams.sportsbook = sportsbook
    if (minAge) rawParams.minAge = minAge

    const params = QuerySchema.parse(rawParams)

    const where: any = {}

    if (params.gameId) {
      where.gameId = params.gameId
    }

    if (params.marketType) {
      where.marketType = params.marketType
    }

    if (params.sportsbook) {
      where.sportsbook = params.sportsbook
    }

    // Filter by sport if specified (requires join)
    if (params.sport) {
      where.game = {
        sport: params.sport,
      }
    }

    // Filter by freshness
    if (params.minAge) {
      const minAgeMs = params.minAge * 60 * 1000
      const cutoff = new Date(Date.now() - minAgeMs)
      where.fetchedAt = {
        gte: cutoff,
      }
    }

    const odds = await prisma.odds.findMany({
      where,
      include: {
        game: {
          select: {
            id: true,
            sport: true,
            homeTeam: true,
            awayTeam: true,
            startTime: true,
            status: true,
          },
        },
      },
      orderBy: {
        fetchedAt: 'desc',
      },
      take: 100,
    })

    // Group by game and sportsbook, keeping only latest
    const latestOdds = new Map<string, typeof odds[0]>()

    for (const odd of odds) {
      const key = `${odd.gameId}-${odd.sportsbook}-${odd.marketType}`
      const existing = latestOdds.get(key)

      if (!existing || odd.fetchedAt > existing.fetchedAt) {
        latestOdds.set(key, odd)
      }
    }

    return NextResponse.json({
      success: true,
      data: Array.from(latestOdds.values()),
      meta: {
        total: latestOdds.size,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('[API] /api/odds error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
