import logger from './logger';

/**
 * Type of errors that can be caught and tracked
 */
export enum ErrorType {
  // Database related errors
  DATABASE = 'database',
  // Authentication related errors
  AUTH = 'auth',
  // Validation errors
  VALIDATION = 'validation',
  // Not found errors
  NOT_FOUND = 'not_found',
  // Rate limiting errors
  RATE_LIMIT = 'rate_limit',
  // Server errors
  SERVER = 'server',
  // Client/API usage errors
  CLIENT = 'client',
  // General unknown errors
  UNKNOWN = 'unknown'
}

/**
 * Interface for error details
 */
export interface ErrorDetails {
  // Human-readable error message
  message: string;
  // Technical error code or identifier
  code?: string;
  // Type of error
  type: ErrorType;
  // HTTP status code if applicable
  statusCode?: number;
  // Original error if this is wrapping another error
  originalError?: Error;
  // Additional context about the error
  context?: Record<string, unknown>;
}

/**
 * Application specific error class
 */
export class AppError extends Error {
  public code?: string;
  public type: ErrorType;
  public statusCode: number;
  public originalError?: Error;
  public context?: Record<string, unknown>;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'AppError';
    this.code = details.code;
    this.type = details.type;
    this.statusCode = details.statusCode || 500;
    this.originalError = details.originalError;
    this.context = details.context;

    // Ensure proper stack trace for this error object
    Error.captureStackTrace(this, AppError);
  }

  /**
   * Returns a plain object representation of the error
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      type: this.type,
      statusCode: this.statusCode,
      context: this.context,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

/**
 * Handle an error by logging it and optionally returning a formatted error
 * @param error The error to handle
 * @param source The source of the error (e.g., service or method name)
 * @param returnError Whether to return a formatted AppError
 * @returns An AppError if returnError is true, otherwise void
 */
export function handleError(
  error: unknown,
  source: string,
  returnError: boolean = false
): AppError | void {
  let appError: AppError;

  // Convert the error to an AppError if it's not already
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError({
      message: error.message,
      type: ErrorType.UNKNOWN,
      originalError: error,
      context: {
        stack: error.stack
      }
    });
  } else {
    appError = new AppError({
      message: String(error),
      type: ErrorType.UNKNOWN,
      context: { originalValue: error }
    });
  }

  // Log the error with its context
  logger.error(
    appError.message,
    source,
    appError.originalError || appError,
    {
      type: appError.type,
      code: appError.code,
      context: appError.context
    }
  );

  if (returnError) {
    return appError;
  }
}

/**
 * Create a new not found error
 * @param entity The entity type that wasn't found
 * @param identifier The identifier that was used to look up the entity
 * @returns A new AppError
 */
export function createNotFoundError(entity: string, identifier: string): AppError {
  return new AppError({
    message: `${entity} not found with identifier: ${identifier}`,
    type: ErrorType.NOT_FOUND,
    code: 'NOT_FOUND',
    statusCode: 404,
    context: {
      entity,
      identifier
    }
  });
}

/**
 * Create a new validation error
 * @param message The validation error message
 * @param fields Object containing the fields that failed validation and why
 * @returns A new AppError
 */
export function createValidationError(message: string, fields?: Record<string, string>): AppError {
  return new AppError({
    message,
    type: ErrorType.VALIDATION,
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    context: {
      fields
    }
  });
}

/**
 * Create a new authentication error
 * @param message The authentication error message
 * @param code Optional specific error code
 * @returns A new AppError
 */
export function createAuthError(message: string, code?: string): AppError {
  return new AppError({
    message,
    type: ErrorType.AUTH,
    code: code || 'AUTH_ERROR',
    statusCode: 401,
    context: {
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Create a new rate limit error
 * @param message The rate limit error message
 * @param resetTime When the rate limit will reset
 * @returns A new AppError
 */
export function createRateLimitError(message: string, resetTime?: Date): AppError {
  return new AppError({
    message,
    type: ErrorType.RATE_LIMIT,
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
    context: {
      resetTime: resetTime?.toISOString()
    }
  });
}

/**
 * Safe JSON parse function that won't throw
 * @param text The text to parse
 * @param fallback Optional fallback value if parsing fails
 * @returns The parsed object or fallback value
 */
export function safeParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    handleError(error, 'safeParse', false);
    return fallback;
  }
}

// Create an object with all error handling functions
const errorHandler = {
  AppError,
  ErrorType,
  handleError,
  createNotFoundError,
  createValidationError,
  createAuthError,
  createRateLimitError,
  safeParse
};

// Export the error handler
export default errorHandler; 