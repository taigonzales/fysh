/**
 * API Route: POST /api/games/preview/batch
 * Batch generates game previews for upcoming games
 *
 * Request body (optional):
 * {
 *   "sport"?: "NBA" | "NFL" | "MLB" | "NHL",
 *   "hoursAhead"?: number (default: 48)
 * }
 */
import { NextRequest } from 'next/server';
import { batchGenerateGamePreviews } from '@/lib/services/ai/game-preview';
import { handleError, successResponse, ValidationError } from '@/lib/middleware/error-handler';

const VALID_SPORTS = ['NBA', 'NFL', 'MLB', 'NHL'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sport, hoursAhead = 48 } = body;

    // Validate sport if provided
    if (sport && !VALID_SPORTS.includes(sport)) {
      throw new ValidationError(
        `Invalid sport. Must be one of: ${VALID_SPORTS.join(', ')}`
      );
    }

    // Validate hoursAhead
    if (hoursAhead && (hoursAhead < 1 || hoursAhead > 168)) {
      throw new ValidationError('hoursAhead must be between 1 and 168 (1 week)');
    }

    console.log('[API] Starting batch game preview generation...', {
      sport,
      hoursAhead,
    });

    const result = await batchGenerateGamePreviews(sport, hoursAhead);

    return successResponse(result, {
      message: 'Batch game preview generation completed',
      summary: {
        processed: result.itemsProcessed,
        skipped: result.itemsSkipped,
        failed: result.itemsFailed,
        duration: result.duration ? `${result.duration}ms` : 'N/A',
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
