/**
 * GET /api/games/[id] - Get single game with odds
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const game = await prisma.game.findUnique({
      where: {
        id: params.id,
      },
      include: {
        odds: {
          orderBy: {
            fetchedAt: 'desc',
          },
          take: 50, // Recent odds from all books
        },
        props: {
          orderBy: {
            fetchedAt: 'desc',
          },
          take: 100,
        },
      },
    })

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          error: 'Game not found',
        },
        { status: 404 }
      )
    }

    // Group odds by sportsbook and market type, keeping only latest
    const latestOdds = new Map<string, typeof game.odds[0]>()

    for (const odd of game.odds) {
      const key = `${odd.sportsbook}-${odd.marketType}`
      const existing = latestOdds.get(key)

      if (!existing || odd.fetchedAt > existing.fetchedAt) {
        latestOdds.set(key, odd)
      }
    }

    // Group props by player and prop type, keeping only latest per sportsbook
    const latestProps = new Map<string, typeof game.props[0]>()

    for (const prop of game.props) {
      const key = `${prop.playerName}-${prop.propType}-${prop.sportsbook}`
      const existing = latestProps.get(key)

      if (!existing || prop.fetchedAt > existing.fetchedAt) {
        latestProps.set(key, prop)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...game,
        odds: Array.from(latestOdds.values()),
        props: Array.from(latestProps.values()),
      },
    })
  } catch (error) {
    console.error('[API] /api/games/[id] error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
