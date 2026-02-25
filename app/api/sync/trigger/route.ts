/**
 * POST /api/sync/trigger - Manual sync trigger (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  runGamesSync,
  runOddsSync,
  runPropsSync,
  runFullSync,
} from '@/lib/services/sync'

const BodySchema = z.object({
  type: z.enum(['games', 'odds', 'props', 'full']),
  adminKey: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const params = BodySchema.parse(body)

    // Verify admin key
    const expectedKey = process.env.ADMIN_API_KEY || 'development-key'

    if (params.adminKey !== expectedKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    console.log(`[API] Manual sync triggered: ${params.type}`)

    let result

    switch (params.type) {
      case 'games':
        result = await runGamesSync()
        break
      case 'odds':
        result = await runOddsSync()
        break
      case 'props':
        result = await runPropsSync()
        break
      case 'full':
        result = await runFullSync()
        break
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('[API] /api/sync/trigger error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
