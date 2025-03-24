import { PrismaClient } from '@prisma/client';
import { retry, RetryOptions as BaseRetryOptions } from '@/lib/retry-utils';
import logger from './logger';

// Type for retry options
export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  shouldRetry: (error: PrismaError) => boolean;
  onRetry?: (error: PrismaError, attempt: number) => void;
}

// Define PrismaError interface
interface PrismaError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}

// Error codes that are worth retrying
export enum PrismaErrorType {
  CONNECTION_ERROR = 'P1001', // Connection error
  TIMEOUT_ERROR = 'P1008',    // Operation timed out
  RATE_LIMIT = 'P1009',       // Database server refused the connection (rate limit)
  UNKNOWN = 'P1000',          // Unknown error
  QUERY_ENGINE_ERROR = 'P2025', // Record not found
}

// Default retry options for database operations
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 3000,
  backoffFactor: 2,
  shouldRetry: (error: PrismaError) => {
    if (!error?.code) return false;
    
    // Check if the error code is one that should be retried
    return [
      PrismaErrorType.CONNECTION_ERROR,
      PrismaErrorType.TIMEOUT_ERROR,
      PrismaErrorType.RATE_LIMIT,
      PrismaErrorType.UNKNOWN
    ].includes(error.code as PrismaErrorType);
  }
};

// Our Prisma client singleton
let prismaClient: PrismaClient | undefined;

/**
 * Creates a new PrismaClient instance with optimized connection parameters
 */
export function createPrismaClient(): PrismaClient {
  logger.info('Creating new PrismaClient instance', 'createPrismaClient');
  
  // Get the SQLite database URL from environment variables
  // Default to a local file path if not provided
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  
  logger.debug(`Using database URL: ${databaseUrl}`, 'createPrismaClient');
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    errorFormat: 'pretty'
  });
}

/**
 * Get the global PrismaClient instance
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    logger.info('Initializing new PrismaClient instance', 'getPrismaClient');
    prismaClient = createPrismaClient();
    
    // Note: process.on is not available in Edge runtime
    // Cleanup will be handled separately for server components
  }
  return prismaClient;
}

/**
 * Disconnect the Prisma client (useful for serverless environments)
 */
export async function disconnectPrisma(): Promise<void> {
  if (prismaClient) {
    logger.info('Disconnecting Prisma client', 'disconnectPrisma');
    await prismaClient.$disconnect();
    prismaClient = undefined;
  }
}

/**
 * Execute a Prisma operation with retry
 * @param operation The database operation to execute
 * @param options Optional retry configuration
 * @returns The result of the operation
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  
  return retry(async () => {
    try {
      return await operation();
    } catch (error) {
      const prismaError = error as PrismaError;
      logger.warn(
        `Database operation error: ${prismaError.message}`, 
        'executeWithRetry',
        { code: prismaError.code, meta: prismaError.meta }
      );
      throw error;
    }
  }, retryOptions);
}

// Get singleton client
const prisma = getPrismaClient();

// Export default client for convenience
export default prisma; 