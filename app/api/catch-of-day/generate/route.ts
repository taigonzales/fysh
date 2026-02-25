/**
 * API Route: POST /api/catch-of-day/generate
 * Generates a new catch of the day
 *
 * Request body:
 * {
 *   "sport"?: "NBA" | "NFL" | "MLB" | "NHL"
 * }
 */
import { NextRequest } from 'next/server';
import { generateCatchOfTheDay } from '@/lib/services/ai/catch-of-day';
import { handleError, successResponse, ValidationError } from '@/lib/middleware/error-handler';

const VALID_SPORTS = ['NBA', 'NFL', 'MLB', 'NHL'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sport } = body;

    // Validate sport if provided
    if (sport && !VALID_SPORTS.includes(sport)) {
      throw new ValidationError(
        `Invalid sport. Must be one of: ${VALID_SPORTS.join(', ')}`
      );
    }

    const catch_ = await generateCatchOfTheDay(sport);

    if (!catch_) {
      return successResponse(
        null,
        { message: 'No high-confidence props available for catch generation' }
      );
    }

    return successResponse(catch_, {
      message: `Generated catch for ${sport || 'all sports'}`,
    });
  } catch (error) {
    return handleError(error);
  }
}
