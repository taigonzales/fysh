/**
 * GET /api/props - Search and filter player props
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const QuerySchema = z.object({
  playerName: z.string().optional(),
  propType: z.string().optional(),
  gameId: z.string().optional(),
  sport: z.enum(['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB', 'NCAAF']).optional(),
  sportsbook: z.string().optional(),
  minLine: z.string().optional().transform(Number),
  maxLine: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filter out null values before parsing
    const rawParams: any = {}
    const playerName = searchParams.get('playerName')
    const propType = searchParams.get('propType')
    const gameId = searchParams.get('gameId')
    const sport = searchParams.get('sport')
    const sportsbook = searchParams.get('sportsbook')
    const minLine = searchParams.get('minLine')
    const maxLine = searchParams.get('maxLine')
    const limit = searchParams.get('limit')

    if (playerName) rawParams.playerName = playerName
    if (propType) rawParams.propType = propType
    if (gameId) rawParams.gameId = gameId
    if (sport) rawParams.sport = sport
    if (sportsbook) rawParams.sportsbook = sportsbook
    if (minLine) rawParams.minLine = minLine
    if (maxLine) rawParams.maxLine = maxLine
    if (limit) rawParams.limit = limit

    const params = QuerySchema.parse(rawParams)

    const where: any = {}

    if (params.playerName) {
      where.playerName = {
        contains: params.playerName,
        mode: 'insensitive',
      }
    }

    if (params.propType) {
      where.propType = params.propType
    }

    if (params.gameId) {
      where.gameId = params.gameId
    }

    if (params.sportsbook) {
      where.sportsbook = params.sportsbook
    }

    if (params.sport) {
      where.game = {
        sport: params.sport,
      }
    }

    if (params.minLine !== undefined || params.maxLine !== undefined) {
      where.line = {}

      if (params.minLine !== undefined) {
        where.line.gte = params.minLine
      }

      if (params.maxLine !== undefined) {
        where.line.lte = params.maxLine
      }
    }

    const limit = Math.min(params.limit || 50, 200)

    const props = await prisma.playerProp.findMany({
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
      take: limit,
    })

    // Group by player, prop type, and sportsbook - keep latest only
    const latestProps = new Map<string, typeof props[0]>()

    for (const prop of props) {
      const key = `${prop.playerName}-${prop.propType}-${prop.sportsbook}-${prop.gameId}`
      const existing = latestProps.get(key)

      if (!existing || prop.fetchedAt > existing.fetchedAt) {
        latestProps.set(key, prop)
      }
    }

    return NextResponse.json({
      success: true,
      data: Array.from(latestProps.values()),
      meta: {
        total: latestProps.size,
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

    console.error('[API] /api/props error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
