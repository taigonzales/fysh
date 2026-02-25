/**
 * Structured logging utility
 */

// ============================================
// Log Levels
// ============================================

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
}

// ============================================
// Logger Configuration
// ============================================

const CURRENT_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO

const ENABLE_COLORS = process.env.NODE_ENV === 'development'

const COLORS = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m', // Green
  [LogLevel.WARN]: '\x1b[33m', // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
}

// ============================================
// Logger Class
// ============================================

class Logger {
  private context: string

  constructor(context: string = 'App') {
    this.context = context
  }

  /**
   * Check if log level should be printed
   */
  private shouldLog(level: LogLevel): boolean {
    return (
      LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[CURRENT_LOG_LEVEL]
    )
  }

  /**
   * Format log message
   */
  private format(
    level: LogLevel,
    message: string,
    meta?: Record<string, any>
  ): string {
    const timestamp = new Date().toISOString()
    const color = ENABLE_COLORS ? COLORS[level] : ''
    const reset = ENABLE_COLORS ? COLORS.RESET : ''
    const bold = ENABLE_COLORS ? COLORS.BOLD : ''

    let output = `${color}${timestamp} [${level.toUpperCase()}]${reset} ${bold}[${this.context}]${reset} ${message}`

    if (meta && Object.keys(meta).length > 0) {
      output += `\n${JSON.stringify(meta, null, 2)}`
    }

    return output
  }

  /**
   * Log message
   */
  private log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    if (!this.shouldLog(level)) return

    const formatted = this.format(level, message, meta)

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.ERROR:
        console.error(formatted)
        break
    }
  }

  /**
   * Debug log
   */
  debug(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, meta)
  }

  /**
   * Info log
   */
  info(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, meta)
  }

  /**
   * Warning log
   */
  warn(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, meta)
  }

  /**
   * Error log
   */
  error(message: string, error?: Error | unknown, meta?: Record<string, any>): void {
    const errorMeta = {
      ...meta,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    }

    this.log(LogLevel.ERROR, message, errorMeta)
  }

  /**
   * Create child logger with additional context
   */
  child(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`)
  }
}

// ============================================
// Singleton Instance
// ============================================

export const logger = new Logger()

// ============================================
// Domain-specific Loggers
// ============================================

export const apiLogger = logger.child('API')
export const syncLogger = logger.child('Sync')
export const dbLogger = logger.child('Database')
export const oddsApiLogger = logger.child('OddsAPI')

// ============================================
// Performance Logging
// ============================================

export class PerformanceTimer {
  private startTime: number
  private logger: Logger
  private operation: string

  constructor(operation: string, logger: Logger = apiLogger) {
    this.startTime = Date.now()
    this.logger = logger
    this.operation = operation

    this.logger.debug(`Starting: ${operation}`)
  }

  /**
   * End timer and log duration
   */
  end(meta?: Record<string, any>): void {
    const duration = Date.now() - this.startTime

    this.logger.info(`Completed: ${this.operation}`, {
      ...meta,
      duration: `${duration}ms`,
    })
  }

  /**
   * Get elapsed time without logging
   */
  elapsed(): number {
    return Date.now() - this.startTime
  }
}

/**
 * Create performance timer
 */
export function startTimer(operation: string, logger?: Logger): PerformanceTimer {
  return new PerformanceTimer(operation, logger)
}

// ============================================
// Request Logging
// ============================================

export interface RequestLogContext {
  method: string
  path: string
  ip?: string
  userId?: string
  userAgent?: string
}

/**
 * Log API request
 */
export function logRequest(
  context: RequestLogContext,
  status: number,
  duration: number,
  meta?: Record<string, any>
): void {
  const message = `${context.method} ${context.path} ${status}`
  const logData = {
    ...context,
    ...meta,
    status,
    duration: `${duration}ms`,
  }

  if (status >= 500) {
    apiLogger.error(message, logData)
  } else if (status >= 400) {
    apiLogger.warn(message, logData)
  } else {
    apiLogger.info(message, logData)
  }
}

// ============================================
// Error Logging
// ============================================

/**
 * Log error with context
 */
export function logError(
  error: Error | unknown,
  context?: string,
  meta?: Record<string, any>
): void {
  const message = error instanceof Error ? error.message : 'Unknown error'
  const logContext = context || 'Error'

  logger.error(`${logContext}: ${message}`, error, meta)
}

// ============================================
// Sync Logging
// ============================================

export interface SyncLogContext {
  operation: string
  sport?: string
  itemsProcessed?: number
  itemsCreated?: number
  itemsUpdated?: number
  itemsSkipped?: number
  errors?: string[]
  duration?: number
}

/**
 * Log sync operation
 */
export function logSync(context: SyncLogContext): void {
  const hasErrors = context.errors && context.errors.length > 0
  const message = `Sync: ${context.operation}`

  if (hasErrors) {
    syncLogger.error(message, context)
  } else {
    syncLogger.info(message, context)
  }
}
