/**
 * Utility functions for retrying operations that may fail temporarily
 */

/**
 * Interface for configuring retry behavior
 */
export interface RetryOptions {
  // Maximum number of retry attempts
  maxAttempts: number;
  
  // Initial delay between retries in milliseconds
  initialDelayMs: number;
  
  // Maximum delay between retries in milliseconds
  maxDelayMs: number;
  
  // Factor by which to increase delay on each retry attempt
  backoffFactor: number;
  
  // Function to determine if a particular error should be retried
  shouldRetry: (error: Error) => boolean;
  
  // Optional callback to be executed on each retry attempt
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffFactor: 2,
  shouldRetry: () => true,
};

/**
 * Sleep for a specified number of milliseconds
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculate delay using exponential backoff with jitter
 * @param attempt Current attempt number (0-based)
 * @param options Retry options
 * @returns Delay time in milliseconds
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  // Calculate exponential backoff
  const exponentialDelay = options.initialDelayMs * Math.pow(options.backoffFactor, attempt);
  
  // Cap at maximum delay
  const cappedDelay = Math.min(exponentialDelay, options.maxDelayMs);
  
  // Add jitter (±20%) to prevent synchronized retries
  const jitter = 0.8 + (Math.random() * 0.4); // Random value between 0.8 and 1.2
  
  return Math.floor(cappedDelay * jitter);
}

/**
 * Retry an async operation with configurable retry logic
 * @param operation The operation to retry
 * @param options Retry options
 * @returns The result of the operation
 * @throws The last error encountered if all retries fail
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  // Merge provided options with defaults
  const retryOptions: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };
  
  let lastError: Error;
  
  // Start with attempt 0 and increment until we reach maxAttempts
  for (let attempt = 0; attempt < retryOptions.maxAttempts; attempt++) {
    try {
      // Attempt the operation
      return await operation();
    } catch (error) {
      // Ensure we have an Error object
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we've exhausted our retry attempts or if this error shouldn't be retried
      const isLastAttempt = attempt >= retryOptions.maxAttempts - 1;
      const shouldRetry = retryOptions.shouldRetry(lastError);
      
      if (isLastAttempt || !shouldRetry) {
        throw lastError;
      }
      
      // Call the onRetry callback if provided
      if (retryOptions.onRetry) {
        retryOptions.onRetry(lastError, attempt + 1);
      }
      
      // Calculate delay for this attempt
      const delayMs = calculateDelay(attempt, retryOptions);
      
      // Wait before next attempt
      await sleep(delayMs);
    }
  }
  
  // This should never be reached due to the throw in the loop,
  // but TypeScript requires a return or throw at the end
  throw new Error('All retry attempts failed');
} 