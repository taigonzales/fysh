/**
 * API Route: POST /api/catch-of-day/batch
 * Batch generates catches for all sports
 *
 * This is typically called by cron jobs or admin actions.
 */
import { NextRequest } from 'next/server';
import { batchGenerateDailyCatches } from '@/lib/services/ai/catch-of-day';
import { handleError, successResponse } from '@/lib/middleware/error-handler';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting batch catch generation...');

    const result = await batchGenerateDailyCatches();

    return successResponse(result, {
      message: 'Batch catch generation completed',
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
