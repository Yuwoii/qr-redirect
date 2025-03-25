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

// Database configuration interface
interface DatabaseConfig {
  url: string;
  provider: 'sqlite' | 'postgresql' | 'mysql' | 'sqlserver';
  directUrl?: string;
  poolConfig?: {
    min: number;
    max: number;
    idle: number;
  };
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
 * Determines the appropriate database configuration based on environment
 * @returns Database configuration object with URL and connection parameters
 */
function getDatabaseConfig(): DatabaseConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  // Default SQLite configuration for development
  const defaultConfig: DatabaseConfig = {
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    provider: 'sqlite'
  };
  
  // Vercel or other PostgreSQL configuration for production
  if (isProduction) {
    // Check for Vercel-specific environment variables
    if (isVercel) {
      logger.info('Detected Vercel environment, using Vercel Postgres configuration', 'getDatabaseConfig');
      const vercelPostgresUrl = process.env.POSTGRES_PRISMA_URL;
      const nonPoolingUrl = process.env.POSTGRES_URL_NON_POOLING;
      
      if (vercelPostgresUrl) {
        return {
          url: vercelPostgresUrl,
          directUrl: nonPoolingUrl, // For direct connections in Edge functions
          provider: 'postgresql'
        };
      } else {
        logger.warn('No Vercel Postgres URL found, checking for standard DATABASE_URL', 'getDatabaseConfig');
      }
    }
    
    // Standard PostgreSQL setup (for both Vercel fallback and other environments)
    const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
    
    // For non-pooled connections (useful for serverless/edge functions)
    const nonPoolingUrl = process.env.POSTGRES_URL_NON_POOLING || postgresUrl;
    
    // If we have a PostgreSQL URL, use it
    if (postgresUrl) {
      logger.info('Using PostgreSQL database connection for production', 'getDatabaseConfig');
      
      // Ensure URL is defined before returning
      const finalUrl = postgresUrl;
      const finalDirectUrl = nonPoolingUrl;
      
      if (!finalUrl) {
        logger.warn('No valid PostgreSQL URL found, falling back to SQLite', 'getDatabaseConfig');
        return defaultConfig;
      }
      
      return {
        url: finalUrl,
        directUrl: finalDirectUrl !== finalUrl ? finalDirectUrl : undefined,
        provider: 'postgresql',
        // Add connection pooling configuration for production
        poolConfig: isVercel ? undefined : {
          min: 2,
          max: 10,
          idle: 10000 // 10 seconds
        }
      };
    } else {
      logger.warn('No PostgreSQL URL found for production, falling back to SQLite', 'getDatabaseConfig');
    }
  }
  
  logger.info('Using SQLite database connection for development', 'getDatabaseConfig');
  return defaultConfig;
}

/**
 * Creates a new PrismaClient instance with optimized connection parameters
 */
export function createPrismaClient(): PrismaClient {
  logger.info('Creating new PrismaClient instance', 'createPrismaClient');
  
  const dbConfig = getDatabaseConfig();
  
  logger.debug(`Using database URL: ${dbConfig.url}`, 'createPrismaClient');
  if (dbConfig.directUrl) {
    logger.debug(`Using direct URL for serverless/edge functions`, 'createPrismaClient');
  }
  
  const prismaOptions: any = {
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: dbConfig.url
      }
    },
    errorFormat: 'pretty'
  };
  
  // Add direct URL if available
  if (dbConfig.directUrl) {
    prismaOptions.datasources.db.directUrl = dbConfig.directUrl;
  }
  
  // Add connection pool options if available
  if (dbConfig.poolConfig) {
    prismaOptions.connectionLimit = dbConfig.poolConfig;
  }
  
  return new PrismaClient(prismaOptions);
}

/**
 * Initializes the database connection and attempts connection
 * Returns true if successful, false otherwise
 */
export async function initializeDatabase(): Promise<boolean> {
  logger.info('Initializing database connection', 'initializeDatabase');
  
  try {
    await waitForDatabaseReady();
    logger.info('Database initialization completed successfully', 'initializeDatabase');
    return true;
  } catch (error) {
    logger.error(`Database initialization failed: ${error}`, 'initializeDatabase');
    return false;
  }
}

/**
 * Wait for the database to be ready with retry
 */
export async function waitForDatabaseReady(maxAttempts = 5): Promise<void> {
  logger.info(`Waiting for database to be ready (max ${maxAttempts} attempts)`, 'waitForDatabaseReady');
  
  let attempts = 0;
  const startTime = Date.now();
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      // Try a simple query to see if the database is ready
      await getPrismaClient().$queryRaw`SELECT 1`;
      const elapsed = Date.now() - startTime;
      logger.info(`Database ready after ${attempts} attempt(s) in ${elapsed}ms`, 'waitForDatabaseReady');
      return;
    } catch (error) {
      if (attempts >= maxAttempts) {
        throw new Error(`Database not ready after ${maxAttempts} attempts`);
      }
      
      logger.warn(`Database not ready (attempt ${attempts}/${maxAttempts}): ${error}`, 'waitForDatabaseReady');
      
      // Exponential backoff
      const delay = Math.min(100 * Math.pow(2, attempts), 2000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
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

// Initialize the database on module load
initializeDatabase().catch(error => {
  logger.error(`Failed to initialize database: ${error}`, 'moduleInit');
});

// Get singleton client
const prisma = getPrismaClient();

// Export default client for convenience
export default prisma; 