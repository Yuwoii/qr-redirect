/**
 * Request context management for tracking request-specific information
 * This helps with tracking requests through the application and correlating logs
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Structure for storing context information throughout a request
 */
export interface RequestContext {
  // Unique identifier for the request
  requestId: string;
  
  // Start time of the request for performance monitoring
  startTime: number;
  
  // Additional data can be added here
  [key: string]: unknown;
}

/**
 * Creates a new request context with default values
 * @returns A new request context object
 */
export function createRequestContext(): RequestContext {
  return {
    requestId: uuidv4(),
    startTime: Date.now(),
  };
}

// For server components we use node's AsyncLocalStorage if available
let asyncLocalStorage: any = null;

// We need to check if we're in a Node.js environment before importing AsyncLocalStorage
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  try {
    // Using dynamic import to avoid issues with browser environments
    import('async_hooks').then((asyncHooks) => {
      const { AsyncLocalStorage } = asyncHooks;
      asyncLocalStorage = new AsyncLocalStorage();
    }).catch(() => {
      console.warn('AsyncLocalStorage not available, request context tracking will be limited');
    });
  } catch (error) {
    console.warn('AsyncLocalStorage not available, request context tracking will be limited');
  }
}

// Fallback storage for client components or when AsyncLocalStorage is not available
const fallbackStorage = {
  requestContext: null as RequestContext | null,
};

/**
 * Get the current request context
 * @returns The current request context or undefined if not in a request
 */
export function getRequestContext(): RequestContext | undefined {
  // If AsyncLocalStorage is available, use it
  if (asyncLocalStorage) {
    return asyncLocalStorage.getStore();
  }
  
  // Otherwise use the fallback
  return fallbackStorage.requestContext || undefined;
}

/**
 * Get the current request ID
 * @returns The current request ID or a fallback ID if not in a request
 */
export function getRequestId(): string {
  const context = getRequestContext();
  return context?.requestId || 'no-request-id';
}

/**
 * Run a function within a request context
 * @param context The request context
 * @param fn The function to run
 * @returns The result of the function
 */
export async function runWithRequestContext<T>(
  context: RequestContext, 
  fn: () => Promise<T> | T
): Promise<T> {
  // If AsyncLocalStorage is available, use it
  if (asyncLocalStorage) {
    return asyncLocalStorage.run(context, fn);
  }
  
  // Otherwise use the fallback
  const previousContext = fallbackStorage.requestContext;
  fallbackStorage.requestContext = context;
  
  try {
    return await fn();
  } finally {
    fallbackStorage.requestContext = previousContext;
  }
}

/**
 * Store for the request context module
 */
const requestContext = {
  getRequestContext,
  getRequestId,
  createRequestContext,
  runWithRequestContext,
};

export default requestContext; 