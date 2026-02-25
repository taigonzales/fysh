/**
 * GET /api/games - List games with filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Request validation schema
const QuerySchema = z.object({
  sport: z.enum(['NBA', 'NFL', 'MLB', 'NHL', 'NCAAB', 'NCAAF']).optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'FINAL']).optional(),
  date: z.string().optional(), // ISO date string
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().optional().transform(Number),
  cursor: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = QuerySchema.parse({
      sport: searchParams.get('sport'),
      status: searchParams.get('status'),
      date: searchParams.get('date'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      limit: searchParams.get('limit'),
      cursor: searchParams.get('cursor'),
    })

    // Build where clause
    const where: any = {}

    if (params.sport) {
      where.sport = params.sport
    }

    if (params.status) {
      where.status = params.status
    }

    // Date filtering
    if (params.date) {
      const date = new Date(params.date)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      where.startTime = {
        gte: date,
        lt: nextDay,
      }
    } else if (params.startDate || params.endDate) {
      where.startTime = {}

      if (params.startDate) {
        where.startTime.gte = new Date(params.startDate)
      }

      if (params.endDate) {
        where.startTime.lte = new Date(params.endDate)
      }
    }

    // Cursor pagination
    if (params.cursor) {
      where.id = {
        lt: params.cursor,
      }
    }

    const limit = Math.min(params.limit || 50, 100) // Max 100 items

    const games = await prisma.game.findMany({
      where,
      orderBy: {
        startTime: 'asc',
      },
      take: limit + 1, // Fetch one extra to check if there's more
      include: {
        _count: {
          select: {
            odds: true,
            props: true,
          },
        },
      },
    })

    // Check if there are more results
    const hasMore = games.length > limit
    const items = hasMore ? games.slice(0, limit) : games

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        total: items.length,
        hasMore,
        nextCursor: hasMore ? items[items.length - 1].id : null,
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

    console.error('[API] /api/games error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
