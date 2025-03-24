import { NextRequest, NextResponse } from 'next/server';
import { AppError, ErrorType, handleError } from './error-handler';
import logger from './logger';

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    type: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Create a successful API response
 * @param data The data to include in the response
 * @param status The HTTP status code (defaults to 200)
 * @returns A NextResponse with the standardized API response
 */
export function apiSuccess<T>(
  data: T,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data
  };

  return NextResponse.json(response, { status });
}

/**
 * Create an error API response
 * @param error The error that occurred
 * @param status The HTTP status code (defaults to 500)
 * @returns A NextResponse with the standardized API error response
 */
export function apiError(
  error: Error | AppError | string,
  status: number = 500
): NextResponse {
  // Convert string errors to AppError
  if (typeof error === 'string') {
    error = new AppError({
      message: error,
      type: ErrorType.SERVER,
      statusCode: status
    });
  }
  
  // Convert standard Error to AppError
  if (!(error instanceof AppError)) {
    error = new AppError({
      message: error.message,
      type: ErrorType.UNKNOWN,
      originalError: error,
      statusCode: status
    });
  }
  
  // Log the error
  handleError(error, 'apiError');
  
  // Create the API response
  const response: ApiResponse<never> = {
    success: false,
    error: {
      message: error.message,
      code: (error as AppError).code,
      type: (error as AppError).type,
      details: process.env.NODE_ENV !== 'production' 
        ? (error as AppError).context 
        : undefined
    }
  };

  return NextResponse.json(
    response, 
    { status: (error as AppError).statusCode || status }
  );
}

/**
 * Wrapper for API route handlers to provide consistent error handling
 * @param handler The API route handler function
 * @returns A wrapped handler function with error handling
 */
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Track API request (useful for monitoring)
      const start = performance.now();
      const { pathname } = req.nextUrl;
      
      // Log the request
      logger.debug(
        `API request: ${req.method} ${pathname}`, 
        'apiRequest'
      );
      
      // Execute the handler
      const response = await handler(req);
      
      // Log request duration
      const duration = Math.round(performance.now() - start);
      logger.debug(
        `API response: ${req.method} ${pathname} - ${response.status} (${duration}ms)`,
        'apiResponse'
      );
      
      return response;
    } catch (error) {
      // Handle and log any uncaught errors
      return apiError(error as Error);
    }
  };
}

/**
 * Interface for validation result
 */
export interface ValidationResult {
  errors: Record<string, string>;
}

/**
 * Type for validation function
 */
export type ValidationFunction = (data: unknown) => ValidationResult | null;

/**
 * Validate request payload against a schema
 * @param payload The request payload to validate
 * @param schema A validation function that returns errors or null
 * @returns The validated payload or throws an error
 */
export function validateRequest<T>(
  payload: unknown, 
  schema: ValidationFunction
): T {
  const validation = schema(payload);
  
  if (validation && Object.keys(validation.errors).length > 0) {
    throw new AppError({
      message: 'Validation error',
      type: ErrorType.VALIDATION,
      statusCode: 400,
      context: { validationErrors: validation.errors }
    });
  }
  
  return payload as T;
}

/**
 * Extract and validate JSON body from a request
 * @param req The NextRequest object
 * @param schema Optional validation schema
 * @returns The parsed and optionally validated body
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  req: NextRequest,
  schema?: ValidationFunction
): Promise<T> {
  try {
    const body = await req.json();
    
    if (schema) {
      return validateRequest<T>(body, schema);
    }
    
    return body as T;
  } catch (error) {
    if ((error as Error).name === 'SyntaxError') {
      throw new AppError({
        message: 'Invalid JSON in request body',
        type: ErrorType.VALIDATION,
        statusCode: 400
      });
    }
    throw error;
  }
}

/**
 * Helper to check for required environment variables
 * @param keys Array of required environment variable keys
 * @throws Error if any variables are missing
 */
export function requireEnvVars(keys: string[]): void {
  const missing = keys.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const error = new AppError({
      message: `Missing required environment variables: ${missing.join(', ')}`,
      type: ErrorType.SERVER,
      statusCode: 500,
      context: { missingVars: missing }
    });
    
    logger.error(
      `Application is missing required environment variables: ${missing.join(', ')}`,
      'requireEnvVars',
      error
    );
    
    throw error;
  }
} 