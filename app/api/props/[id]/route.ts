/**
 * GET /api/props/[id] - Get single player prop with context
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prop = await prisma.playerProp.findUnique({
      where: {
        id: params.id,
      },
      include: {
        game: {
          include: {
            odds: {
              orderBy: {
                fetchedAt: 'desc',
              },
              take: 10,
            },
          },
        },
        picks: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    })

    if (!prop) {
      return NextResponse.json(
        {
          success: false,
          error: 'Player prop not found',
        },
        { status: 404 }
      )
    }

    // Get historical performance for this player/prop combination
    const historicalProps = await prisma.playerProp.findMany({
      where: {
        playerName: prop.playerName,
        propType: prop.propType,
        game: {
          sport: prop.game.sport,
          status: 'FINAL',
        },
      },
      orderBy: {
        game: {
          startTime: 'desc',
        },
      },
      take: 10,
      include: {
        game: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            startTime: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...prop,
        historical: historicalProps,
      },
    })
  } catch (error) {
    console.error('[API] /api/props/[id] error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
