/**
 * POST /api/waitlist - Capture waitlist signups from landing page
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  referralSource: z.string().optional(),
  interests: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = waitlistSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email, referralSource, interests } = validation.data

    // Check if email already exists
    const existing = await prisma.waitlist.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
          message: "You're already on the waitlist!",
        },
        { status: 409 }
      )
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email,
        referralSource: referralSource || undefined,
        interests: interests || undefined,
      },
    })

    console.log('[Waitlist] New signup:', email)

    return NextResponse.json(
      {
        success: true,
        message: "You've been added to the waitlist!",
        data: {
          id: waitlistEntry.id,
          email: waitlistEntry.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Waitlist] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
