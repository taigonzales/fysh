/**
 * API Route: GET /api/props/:id/analyze
 * Returns AI-powered analysis for a specific prop
 */
import { NextRequest, NextResponse } from 'next/server';
import { analyzeProp } from '@/lib/services/ai/prop-analyzer';
import { handleError } from '@/lib/middleware/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propId = params.id;

    if (!propId) {
      return NextResponse.json(
        { error: 'Prop ID is required' },
        { status: 400 }
      );
    }

    // Analyze the prop using AI
    const analysis = await analyzeProp(propId);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    return handleError(error);
  }
}
