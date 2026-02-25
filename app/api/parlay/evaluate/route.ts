/**
 * API Route: POST /api/parlay/evaluate
 * Evaluates a multi-leg parlay for correlation risks and quality
 *
 * Request body:
 * {
 *   "legs": [
 *     { "propId": "prop-123" },
 *     { "propId": "prop-456" }
 *   ]
 * }
 */
import { NextRequest, NextResponse } from 'next/server';
import { evaluateParlay } from '@/lib/services/ai/parlay-evaluator';
import { handleError, successResponse, ValidationError } from '@/lib/middleware/error-handler';
import { z } from 'zod';

// Request validation schema
const EvaluateParlaySchema = z.object({
  legs: z
    .array(
      z.object({
        propId: z.string().min(1, 'Prop ID is required'),
      })
    )
    .min(2, 'Parlay must have at least 2 legs')
    .max(10, 'Parlay cannot have more than 10 legs'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => {
      throw new ValidationError('Invalid JSON in request body');
    });

    // Validate request body
    const validated = EvaluateParlaySchema.parse(body);

    console.log(`[API] Evaluating parlay with ${validated.legs.length} legs`);

    // Evaluate the parlay
    const evaluation = await evaluateParlay(validated.legs);

    return successResponse(evaluation, {
      message: 'Parlay evaluation completed',
      legCount: validated.legs.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
