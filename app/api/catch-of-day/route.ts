/**
 * API Route: GET /api/catch-of-day
 * Returns today's catch of the day (optionally filtered by sport)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getTodaysCatch } from '@/lib/services/ai/catch-of-day';
import { handleError, successResponse } from '@/lib/middleware/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') || undefined;

    const catch_ = await getTodaysCatch(sport);

    if (!catch_) {
      return NextResponse.json(
        {
          success: false,
          error: 'No catch of the day available',
          message: sport
            ? `No catch available for ${sport} today`
            : 'No catch available today',
        },
        { status: 404 }
      );
    }

    return successResponse(catch_);
  } catch (error) {
    return handleError(error);
  }
}
