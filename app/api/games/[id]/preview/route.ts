/**
 * API Route: /api/games/:id/preview
 * GET - Retrieve existing game preview
 * POST - Generate new game preview
 */
import { NextRequest, NextResponse } from 'next/server';
import { getGamePreview, generateGamePreview } from '@/lib/services/ai/game-preview';
import { handleError, successResponse, NotFoundError } from '@/lib/middleware/error-handler';

/**
 * GET /api/games/:id/preview
 * Returns AI-generated game preview
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const preview = await getGamePreview(gameId);

    if (!preview) {
      throw new NotFoundError(`No preview available for game ${gameId}`);
    }

    return successResponse(preview);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/games/:id/preview
 * Generates a new game preview using AI
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const preview = await generateGamePreview(gameId);

    return successResponse(preview, {
      message: 'Game preview generated successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}
