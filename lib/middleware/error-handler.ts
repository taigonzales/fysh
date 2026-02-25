/**
 * Standardized error handling middleware
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/config/api'

// ============================================
// Error Types
// ============================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(ERROR_CODES.BAD_REQUEST, message, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(ERROR_CODES.UNAUTHORIZED, message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(ERROR_CODES.FORBIDDEN, message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(ERROR_CODES.NOT_FOUND, message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(ERROR_CODES.CONFLICT, message, details)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(ERROR_CODES.RATE_LIMITED, message)
    this.name = 'RateLimitError'
  }
}

// ============================================
// Error Handler
// ============================================

/**
 * Handle errors and return standardized response
 */
export function handleError(error: unknown): NextResponse {
  // Log error
  console.error('[API Error]', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        details: error.errors,
      },
      { status: ERROR_CODES.BAD_REQUEST }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error)
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  // Unknown errors
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred'

  return NextResponse.json(
    {
      success: false,
      error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
      message:
        process.env.NODE_ENV === 'development' ? message : undefined,
    },
    { status: ERROR_CODES.INTERNAL_ERROR }
  )
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return NextResponse.json(
        {
          success: false,
          error: 'Resource already exists',
          details: error.meta,
        },
        { status: ERROR_CODES.CONFLICT }
      )

    case 'P2025': // Record not found
      return NextResponse.json(
        {
          success: false,
          error: 'Resource not found',
        },
        { status: ERROR_CODES.NOT_FOUND }
      )

    case 'P2003': // Foreign key constraint
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid reference',
          details: error.meta,
        },
        { status: ERROR_CODES.BAD_REQUEST }
      )

    default:
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: ERROR_CODES.INTERNAL_ERROR }
      )
  }
}

// ============================================
// Success Response
// ============================================

export interface SuccessResponse<T = any> {
  success: true
  data: T
  meta?: Record<string, any>
}

/**
 * Create standardized success response
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta,
  })
}

// ============================================
// Async Handler Wrapper
// ============================================

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleError(error)
    }
  }
}
