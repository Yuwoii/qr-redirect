/**
 * Database health check utilities
 * These utilities help verify database connectivity and health
 */

import { getPrismaClient, executeWithRetry } from './prisma-client';
import logger from './logger';

/**
 * Interface for the health check result
 */
export interface HealthCheckResult {
  isHealthy: boolean;
  responseTimeMs: number;
  error?: string;
  timestamp: Date;
}

/**
 * Determines if we're running in an Edge runtime environment
 * where certain Node.js APIs might not be available
 */
function isEdgeRuntime(): boolean {
  return typeof process.env.NEXT_RUNTIME === 'string' && 
         process.env.NEXT_RUNTIME === 'edge';
}

/**
 * Performs a health check on the database
 * 
 * @returns A promise that resolves to the health check result
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  // Skip actual checks in Edge runtime and return a placeholder
  if (isEdgeRuntime()) {
    return {
      isHealthy: true,
      responseTimeMs: 0,
      timestamp: new Date()
    };
  }
  
  const startTime = Date.now();
  const prisma = getPrismaClient();
  
  try {
    // Execute a simple query to check database connectivity
    // Using a simple count query that works with any database including SQLite
    await executeWithRetry(() => prisma.$queryRaw`SELECT 1`);
    
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    
    // Log slow responses (over 500ms)
    if (responseTimeMs > 500) {
      logger.warn(`Slow database response: ${responseTimeMs}ms`, 'checkDatabaseHealth', 
        { responseTimeMs });
    }
    
    return {
      isHealthy: true,
      responseTimeMs,
      timestamp: new Date()
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    
    // Convert to a proper error object
    const dbError = error instanceof Error ? error : new Error(String(error));
    
    logger.error(
      `Database health check failed: ${dbError.message}`, 
      'checkDatabaseHealth',
      dbError
    );
    
    return {
      isHealthy: false,
      responseTimeMs,
      error: dbError.message,
      timestamp: new Date()
    };
  }
}

/**
 * Checks if the database is ready to handle requests
 * Useful for orchestrating startup dependencies
 * 
 * @param maxRetries Maximum number of retries before giving up
 * @param retryIntervalMs Milliseconds to wait between retries
 * @returns Promise resolving to true if database is ready, false otherwise
 */
export async function waitForDatabaseReady(
  maxRetries = 5,
  retryIntervalMs = 2000
): Promise<boolean> {
  // Skip actual checks in Edge runtime and return success
  if (isEdgeRuntime()) {
    return true;
  }
  
  logger.info(`Waiting for database to be ready (max ${maxRetries} attempts)`, 'waitForDatabaseReady');
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { isHealthy, responseTimeMs } = await checkDatabaseHealth();
    
    if (isHealthy) {
      logger.info(
        `Database ready after ${attempt + 1} attempt(s) in ${responseTimeMs}ms`,
        'waitForDatabaseReady'
      );
      return true;
    }
    
    logger.warn(
      `Database not ready on attempt ${attempt + 1}/${maxRetries}, waiting ${retryIntervalMs}ms`,
      'waitForDatabaseReady'
    );
    
    // Wait before trying again
    await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
  }
  
  logger.error(
    `Database not ready after ${maxRetries} attempts, giving up`,
    'waitForDatabaseReady',
    new Error('Database connection timeout')
  );
  
  return false;
}

// Export for easier importing
export default {
  checkDatabaseHealth,
  waitForDatabaseReady
}; 