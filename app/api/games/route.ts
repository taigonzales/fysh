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

    // Filter out null values before parsing
    const rawParams: any = {}
    const sport = searchParams.get('sport')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')
    const cursor = searchParams.get('cursor')

    if (sport) rawParams.sport = sport
    if (status) rawParams.status = status
    if (date) rawParams.date = date
    if (startDate) rawParams.startDate = startDate
    if (endDate) rawParams.endDate = endDate
    if (limit) rawParams.limit = limit
    if (cursor) rawParams.cursor = cursor

    const params = QuerySchema.parse(rawParams)

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

    const pageLimit = Math.min(params.limit || 50, 100) // Max 100 items

    const games = await prisma.game.findMany({
      where,
      orderBy: {
        startTime: 'asc',
      },
      take: pageLimit + 1, // Fetch one extra to check if there's more
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
    const hasMore = games.length > pageLimit
    const items = hasMore ? games.slice(0, pageLimit) : games

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        total: items.length,
        hasMore,
        nextCursor: hasMore ? items[items.length - 1]?.id : null,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
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
