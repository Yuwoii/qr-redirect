import { NextRequest, NextResponse } from 'next/server';
import logger from './logger';
import { createRateLimitError } from './error-handler';

/**
 * Configuration for rate limiting
 */
interface RateLimiterOptions {
  // Max number of requests allowed in the window
  maxRequests: number;
  
  // Time window in seconds
  windowInSeconds: number;
  
  // An identifier for this rate limiter
  identifier: string;
}

/**
 * Interface for rate limit tracking
 */
interface RateLimitRecord {
  // Number of requests so far
  count: number;
  
  // When the window started (Unix timestamp)
  startTime: number;
  
  // When the window expires (Unix timestamp)
  expiresAt: number;
}

// In-memory store for rate limits (not persisted across restarts/deployments)
// Note: For production, use Redis or another shared cache for distributed deployments
const rateLimit = new Map<string, RateLimitRecord>();

/**
 * Get a cache key for a specific client and limiter
 */
function getCacheKey(clientId: string, limiterIdentifier: string): string {
  return `ratelimit:${limiterIdentifier}:${clientId}`;
}

/**
 * Extract client IP address from the request
 * Next.js 13+ provides headers().get('x-forwarded-for') or similar
 */
function getClientIp(req: NextRequest): string {
  // Try to get IP from X-Forwarded-For header (common when behind a proxy)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can be a comma-separated list; use the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }
  
  // Try to get Real IP header (used by some proxies)
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fall back to a placeholder if we can't determine the IP
  return 'unknown-client';
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  
  // Find expired entries
  const expiredKeys: string[] = [];
  rateLimit.forEach((record, key) => {
    if (record.expiresAt < now) {
      expiredKeys.push(key);
    }
  });
  
  // Remove expired entries
  if (expiredKeys.length > 0) {
    logger.debug(`Cleaning up ${expiredKeys.length} expired rate limit records`, 'cleanupRateLimits');
    expiredKeys.forEach(key => rateLimit.delete(key));
  }
}

/**
 * Reset rate limit for a client (useful for testing or manual intervention)
 */
export function resetRateLimit(clientId: string, limiterIdentifier: string): void {
  const key = getCacheKey(clientId, limiterIdentifier);
  rateLimit.delete(key);
  logger.info(`Reset rate limit for ${clientId} on ${limiterIdentifier}`, 'resetRateLimit');
}

/**
 * Create a rate limiter middleware for Next.js API routes
 * @param options Rate limiter configuration
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { maxRequests, windowInSeconds, identifier } = options;
  
  /**
   * Next.js middleware function for rate limiting
   */
  return async function rateLimiterMiddleware(
    req: NextRequest
  ): Promise<NextResponse | null> {
    // Extract client identifier from request
    const clientIp = getClientIp(req);
    
    // Create a unique key for this client and limiter
    const key = getCacheKey(clientIp, identifier);
    
    // Get current timestamp
    const now = Date.now();
    
    // Periodically clean up expired records (do this occasionally)
    if (Math.random() < 0.1) {
      cleanupRateLimits();
    }
    
    // Get or create rate limit record for this client
    let record = rateLimit.get(key);
    if (!record || record.expiresAt < now) {
      // Create a new record if none exists or the window expired
      record = {
        count: 0,
        startTime: now,
        expiresAt: now + (windowInSeconds * 1000)
      };
    }
    
    // Increment the request count
    record.count++;
    
    // Save updated record
    rateLimit.set(key, record);
    
    // Calculate time remaining in the window
    const resetTime = new Date(record.expiresAt);
    const timeRemainingSeconds = Math.ceil((record.expiresAt - now) / 1000);
    
    // Add rate limit headers to all responses
    const headers = {
      'X-RateLimit-Limit': String(maxRequests),
      'X-RateLimit-Remaining': String(Math.max(0, maxRequests - record.count)),
      'X-RateLimit-Reset': String(Math.ceil(record.expiresAt / 1000))
    };
    
    // If the client exceeded their rate limit
    if (record.count > maxRequests) {
      logger.warn(
        `Rate limit exceeded for ${clientIp} on ${identifier}`, 
        'rateLimiterMiddleware',
        { count: record.count, limit: maxRequests }
      );
      
      // Create a rate limit error
      const error = createRateLimitError(
        `Too many requests. Please try again in ${timeRemainingSeconds} seconds.`,
        resetTime
      );
      
      // Return a rate limit exceeded response
      return new NextResponse(
        JSON.stringify(error.toJSON()),
        {
          status: 429,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Retry-After': String(timeRemainingSeconds)
          }
        }
      );
    }
    
    // If we're getting close to the limit, log a warning
    if (record.count >= maxRequests * 0.8) {
      logger.debug(
        `Client ${clientIp} approaching rate limit on ${identifier}`, 
        'rateLimiterMiddleware',
        { count: record.count, limit: maxRequests }
      );
    }
    
    // Return null to allow the request to proceed
    return null;
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // For general API access - 60 requests per minute
  api: createRateLimiter({
    maxRequests: 60,
    windowInSeconds: 60,
    identifier: 'api'
  }),
  
  // For authentication-related endpoints - 10 attempts per minute
  auth: createRateLimiter({
    maxRequests: 10,
    windowInSeconds: 60,
    identifier: 'auth'
  }),
  
  // For QR code generation - 30 requests per minute
  qrGeneration: createRateLimiter({
    maxRequests: 30,
    windowInSeconds: 60,
    identifier: 'qr-generation'
  })
};

export default rateLimiters; 