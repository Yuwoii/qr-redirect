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

// For server components we need a way to track context across async operations
// We'll use a simple shared context approach that's safe in all environments

// Fallback storage for Edge runtime, client components, and other environments
const fallbackStorage = {
  requestContext: null as RequestContext | null,
};

// Detect Edge Runtime to avoid any Node.js specific APIs
const isEdgeRuntime = typeof process !== 'undefined' && !!process.env.EDGE_RUNTIME;
// Detect browser environment
const isBrowser = typeof window !== 'undefined';

// Only try to use AsyncLocalStorage in Node.js environments (not Edge, not browser)
let asyncLocalStorage: any = null;

// We completely avoid using process.versions or any other Node.js specific APIs
// that might cause issues in Edge Runtime
if (!isEdgeRuntime && !isBrowser) {
  try {
    // The safest approach that works with tree-shaking and Edge compatibility
    // No process.versions check, no eval(), no dynamic imports
    if (typeof require === 'function') {
      const asyncHooks = require('async_hooks');
      if (asyncHooks && typeof asyncHooks.AsyncLocalStorage === 'function') {
        asyncLocalStorage = new asyncHooks.AsyncLocalStorage();
      }
    }
  } catch (error) {
    // Silent fallback for Edge compatibility
    // No console.warn or console.error that might cause issues
    asyncLocalStorage = null;
  }
}

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