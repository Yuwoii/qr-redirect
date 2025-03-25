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
// We'll use a simplified approach that works in all environments
let asyncLocalStorage: any = null;

// Safely check for Node.js environment without direct imports that might break in browsers
const isNodeEnvironment = typeof process !== 'undefined' && 
  process.versions != null && 
  process.versions.node != null &&
  typeof window === 'undefined';

// Initialize AsyncLocalStorage if we're in a Node.js environment and not in Edge Runtime
if (isNodeEnvironment && !process.env.EDGE_RUNTIME) {
  // Load AsyncLocalStorage dynamically only in Node.js environment
  // This pattern avoids issues with Edge and client environments
  try {
    // Use a more dynamic approach that won't break during bundling
    const dynamicRequire = eval('require');
    const asyncHooks = dynamicRequire('async_hooks');
    const { AsyncLocalStorage } = asyncHooks;
    asyncLocalStorage = new AsyncLocalStorage();
  } catch (error) {
    console.warn('AsyncLocalStorage not available, using fallback context storage');
  }
}

// Fallback storage for client components, Edge runtime, or when AsyncLocalStorage is not available
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