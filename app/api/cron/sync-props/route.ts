/**
 * GET /api/cron/sync-props - Vercel Cron endpoint for props sync (30min interval)
 * This endpoint is called automatically by Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server'
import { runPropsSync } from '@/lib/services/sync'

export async function GET(request: NextRequest) {
  try {
    // Verify Vercel Cron secret
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    console.log('[Cron] Starting scheduled props sync...')

    const result = await runPropsSync()

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('[Cron] Props sync failed:', error)

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
