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
  PREPARED_STATEMENT_ERROR = '42P05', // PostgreSQL: prepared statement already exists
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

// Global PrismaClient for non-serverless environments
let globalPrismaClient: PrismaClient | undefined;

// Cache for PrismaClient instances in serverless environments
// Using WeakMap to allow garbage collection of PrismaClient instances
const clientCache = new Map<string, {
  client: PrismaClient;
  lastUsed: number;
}>();

// Maximum idle time for a client before it's removed from the cache (5 minutes)
const MAX_CLIENT_IDLE_TIME = 5 * 60 * 1000;

// Maximum number of clients to keep in the cache
const MAX_CLIENT_CACHE_SIZE = 10;

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
 * Cleans up idle PrismaClient instances from the cache
 */
function cleanupIdleClients(): void {
  const now = Date.now();
  let deleted = 0;
  
  for (const [key, { lastUsed }] of clientCache.entries()) {
    if (now - lastUsed > MAX_CLIENT_IDLE_TIME) {
      const cachedClient = clientCache.get(key);
      if (cachedClient) {
        // Disconnect the client before removing it
        cachedClient.client.$disconnect().catch(error => {
          logger.warn(`Error disconnecting idle client: ${error}`, 'cleanupIdleClients');
        });
        clientCache.delete(key);
        deleted++;
      }
    }
  }
  
  if (deleted > 0) {
    logger.debug(`Cleaned up ${deleted} idle database clients`, 'cleanupIdleClients');
  }
  
  // If the cache is still too large, remove the oldest clients
  if (clientCache.size > MAX_CLIENT_CACHE_SIZE) {
    const sortedEntries = Array.from(clientCache.entries())
      .sort(([, a], [, b]) => a.lastUsed - b.lastUsed);
    
    const toRemove = sortedEntries.slice(0, clientCache.size - MAX_CLIENT_CACHE_SIZE);
    for (const [key] of toRemove) {
      const cachedClient = clientCache.get(key);
      if (cachedClient) {
        cachedClient.client.$disconnect().catch(error => {
          logger.warn(`Error disconnecting excess client: ${error}`, 'cleanupIdleClients');
        });
        clientCache.delete(key);
      }
    }
    
    logger.debug(`Removed ${toRemove.length} excess database clients`, 'cleanupIdleClients');
  }
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
  
  // Specifically for PostgreSQL in serverless environments, we add parameters to avoid prepared statement issues
  let finalUrl = dbConfig.url;
  
  if (dbConfig.provider === 'postgresql' && (process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    // Add parameters to disable prepared statements if they're not already in the URL
    if (!finalUrl.includes('pgbouncer=true')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }
    
    // Ensure schema caching is disabled to prevent prepared statement conflicts
    if (!finalUrl.includes('schema_cache_mode=bypass')) {
      finalUrl += '&schema_cache_mode=bypass';
    }
    
    // Set statement timeout to prevent long-running queries
    if (!finalUrl.includes('statement_timeout')) {
      finalUrl += '&statement_timeout=60000';
    }
    
    // Ensure we're using the simple protocol to avoid prepared statements
    if (!finalUrl.includes('options=')) {
      finalUrl += '&options=-c%20client_min_messages%3Dwarning%20-c%20statement_timeout%3D60s%20-c%20idle_in_transaction_session_timeout%3D60s';
    }
    
    logger.debug(`Enhanced PostgreSQL URL for serverless environment`, 'createPrismaClient');
  }
  
  // Create Prisma options with proper flat structure for datasources
  const prismaOptions: any = {
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    datasources: {
      db: { url: finalUrl }
    },
    errorFormat: 'pretty'
  };
  
  // Add connection pool options if available
  if (dbConfig.poolConfig) {
    prismaOptions.connectionLimit = dbConfig.poolConfig;
  }
  
  // Create the PrismaClient instance
  const client = new PrismaClient(prismaOptions);
  
  // If we have a directUrl, set up a connection for direct access
  // This is done separately from the client instantiation to avoid the validation error
  if (dbConfig.directUrl && process.env.VERCEL === '1') {
    logger.debug(`Setting up Edge-compatible non-pooling connection`, 'createPrismaClient');
    try {
      // Use a safe approach that's compatible with Prisma's validation
      // @ts-ignore - Accessing internal property for Edge compatibility
      if (client._engineConfig && client._engineConfig.datasources) {
        // Add the same parameters to the direct URL
        let enhancedDirectUrl = dbConfig.directUrl;
        if (dbConfig.provider === 'postgresql') {
          if (!enhancedDirectUrl.includes('pgbouncer=true')) {
            enhancedDirectUrl += (enhancedDirectUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
          }
          
          if (!enhancedDirectUrl.includes('schema_cache_mode=bypass')) {
            enhancedDirectUrl += '&schema_cache_mode=bypass';
          }
        }
        
        // @ts-ignore - Accessing internal property for Edge compatibility
        client._engineConfig.datasources.db.directUrl = enhancedDirectUrl;
      }
    } catch (error) {
      logger.warn(`Could not set direct URL: ${error}`, 'createPrismaClient');
    }
  }
  
  return client;
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
 * Get a PrismaClient instance - uses different strategies based on environment
 */
export function getPrismaClient(): PrismaClient {
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  // For serverless environments, we use a client-per-request approach to avoid prepared statement conflicts
  if (isServerless) {
    // Create a unique key for this request based on environment and timestamp
    const requestId = process.env.REQUEST_ID || process.env.VERCEL_ID || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Occasionally clean up idle clients
    if (Math.random() < 0.1) {
      cleanupIdleClients();
    }
    
    // Check if we have a cached client for this request
    const cachedClient = clientCache.get(requestId);
    if (cachedClient) {
      // Update the last used timestamp
      cachedClient.lastUsed = Date.now();
      return cachedClient.client;
    }
    
    // Create a new client for this request
    logger.debug(`Creating new PrismaClient for request ${requestId}`, 'getPrismaClient');
    const client = createPrismaClient();
    
    // Add it to the cache
    clientCache.set(requestId, { client, lastUsed: Date.now() });
    
    return client;
  }
  
  // For non-serverless environments, we use a singleton client
  if (!globalPrismaClient) {
    logger.info('Initializing global PrismaClient instance', 'getPrismaClient');
    globalPrismaClient = createPrismaClient();
    
    // Set up cleanup for non-Edge environments
    if (typeof process !== 'undefined' && process.on && !process.env.EDGE_RUNTIME) {
      process.on('beforeExit', async () => {
        await disconnectPrisma();
      });
    }
  }
  
  return globalPrismaClient;
}

/**
 * Disconnect the Prisma client (useful for serverless environments)
 */
export async function disconnectPrisma(): Promise<void> {
  // Disconnect the global client if it exists
  if (globalPrismaClient) {
    logger.info('Disconnecting global Prisma client', 'disconnectPrisma');
    await globalPrismaClient.$disconnect();
    globalPrismaClient = undefined;
  }
  
  // Disconnect and clear all cached clients
  for (const [key, { client }] of clientCache.entries()) {
    try {
      await client.$disconnect();
    } catch (error) {
      logger.warn(`Error disconnecting cached client: ${error}`, 'disconnectPrisma');
    }
  }
  
  clientCache.clear();
  logger.info('All Prisma clients disconnected', 'disconnectPrisma');
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

// Get singleton client - now using the environment-aware approach
const prisma = getPrismaClient();

// Export default client for convenience
export default prisma; 