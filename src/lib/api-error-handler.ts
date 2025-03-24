/**
 * Global API error handling utilities
 * This provides consistent error handling for all API routes
 */

import { NextResponse } from 'next/server';
import logger from './logger';
import { getRequestId } from './request-context';

/**
 * Custom API error type with status code
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;
  
  constructor(
    message: string, 
    statusCode = 500, 
    code?: string, 
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Common error types
 */
export const ErrorTypes = {
  VALIDATION_ERROR: 'validation_error',
  AUTHENTICATION_ERROR: 'authentication_error',
  AUTHORIZATION_ERROR: 'authorization_error',
  NOT_FOUND_ERROR: 'not_found_error',
  CONFLICT_ERROR: 'conflict_error',
  RATE_LIMIT_ERROR: 'rate_limit_error',
  DATABASE_ERROR: 'database_error',
  EXTERNAL_SERVICE_ERROR: 'external_service_error',
  INTERNAL_SERVER_ERROR: 'internal_server_error',
};

/**
 * Creates a validation error
 */
export function createValidationError(message: string, details?: Record<string, unknown>): ApiError {
  return new ApiError(message, 400, ErrorTypes.VALIDATION_ERROR, details);
}

/**
 * Creates an authentication error
 */
export function createAuthenticationError(message = 'Not authenticated'): ApiError {
  return new ApiError(message, 401, ErrorTypes.AUTHENTICATION_ERROR);
}

/**
 * Creates an authorization error
 */
export function createAuthorizationError(message = 'Not authorized'): ApiError {
  return new ApiError(message, 403, ErrorTypes.AUTHORIZATION_ERROR);
}

/**
 * Creates a not found error
 */
export function createNotFoundError(message = 'Resource not found'): ApiError {
  return new ApiError(message, 404, ErrorTypes.NOT_FOUND_ERROR);
}

/**
 * Creates a conflict error
 */
export function createConflictError(message: string, details?: Record<string, unknown>): ApiError {
  return new ApiError(message, 409, ErrorTypes.CONFLICT_ERROR, details);
}

/**
 * Creates a rate limit error
 */
export function createRateLimitError(message = 'Rate limit exceeded'): ApiError {
  return new ApiError(message, 429, ErrorTypes.RATE_LIMIT_ERROR);
}

/**
 * Creates a database error
 */
export function createDatabaseError(message: string): ApiError {
  return new ApiError(message, 500, ErrorTypes.DATABASE_ERROR);
}

/**
 * Creates an external service error
 */
export function createExternalServiceError(message: string): ApiError {
  return new ApiError(message, 502, ErrorTypes.EXTERNAL_SERVICE_ERROR);
}

/**
 * Maps common error types to API errors
 * @param error The error to map
 * @returns An ApiError instance
 */
export function mapErrorToApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return new ApiError(
      error.message,
      500,
      ErrorTypes.INTERNAL_SERVER_ERROR
    );
  }
  
  // Handle unknown errors
  return new ApiError(
    typeof error === 'string' ? error : 'An unknown error occurred',
    500,
    ErrorTypes.INTERNAL_SERVER_ERROR
  );
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    requestId: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Safely gets the request ID or returns a fallback
 */
function safeGetRequestId(): string {
  try {
    return getRequestId();
  } catch (e) {
    return 'unknown-request-id';
  }
}

/**
 * Converts an error to a NextResponse with appropriate status code and JSON body
 * @param error The error to convert
 * @param source The source of the error for logging
 * @returns A NextResponse
 */
export function handleApiError(error: unknown, source = 'api'): NextResponse {
  // Map to an API error
  const apiError = mapErrorToApiError(error);
  
  // Log the error
  logger.error(
    `API Error: ${apiError.message}`,
    source,
    apiError instanceof Error ? apiError : undefined,
    {
      statusCode: apiError.statusCode,
      code: apiError.code,
      details: apiError.details,
    }
  );
  
  // Create a sanitized error response
  const errorResponse: ErrorResponse = {
    error: {
      message: apiError.message,
      code: apiError.code || 'unknown_error',
      requestId: safeGetRequestId(),
    },
  };
  
  // Include error details in non-production environments
  if (process.env.NODE_ENV !== 'production' && apiError.details) {
    errorResponse.error.details = apiError.details;
  }
  
  // Return as JSON response with appropriate status code
  return NextResponse.json(
    errorResponse,
    { status: apiError.statusCode }
  );
}

export default {
  handleApiError,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createConflictError,
  createRateLimitError,
  createDatabaseError,
  createExternalServiceError,
  ApiError,
  ErrorTypes,
}; 