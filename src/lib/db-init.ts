/**
 * Database initialization utility
 * Handles database startup checks and initialization
 */

import { waitForDatabaseReady } from './db-health';
import logger from './logger';

// Whether the database has been initialized
let isDatabaseInitialized = false;

/**
 * Initializes the database connection
 * Ensures the database is ready before the application serves requests
 * 
 * @returns Promise that resolves when the database is ready
 */
export async function initializeDatabase(): Promise<boolean> {
  // Only initialize once
  if (isDatabaseInitialized) {
    return true;
  }
  
  logger.info('Initializing database connection', 'initializeDatabase');
  
  try {
    // In edge runtime or during build time, just return success
    if (typeof process.env.NEXT_RUNTIME === 'string' && process.env.NEXT_RUNTIME === 'edge') {
      logger.info('Skipping database initialization in Edge runtime', 'initializeDatabase');
      return true;
    }
    
    // Wait for the database to be ready
    const isReady = await waitForDatabaseReady();
    
    if (isReady) {
      isDatabaseInitialized = true;
      logger.info('Database initialization completed successfully', 'initializeDatabase');
      return true;
    } else {
      logger.error(
        'Failed to initialize database connection',
        'initializeDatabase'
      );
      return false;
    }
  } catch (error) {
    logger.error(
      'Error initializing database',
      'initializeDatabase'
    );
    return false;
  }
}

// Export for easier importing
export default {
  initializeDatabase,
  isDatabaseInitialized: () => isDatabaseInitialized
}; 