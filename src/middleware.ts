import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from './lib/rate-limiter';
import logger from './lib/logger';
import { createRequestContext, runWithRequestContext } from './lib/request-context';

// Skip database initialization in Edge Runtime
// We'll initialize it in a server component instead

// Set paths that don't need request context tracking (static assets, etc.)
const EXCLUDED_PATHS = [
  '/_next/',
  '/favicon.ico',
  '/static/',
  '/images/',
];

/**
 * Check if a path should be excluded from middleware processing
 */
function isExcludedPath(path: string): boolean {
  return EXCLUDED_PATHS.some(prefix => path.startsWith(prefix));
}

/**
 * Next.js global middleware for request processing
 */
export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  // Skip processing for excluded paths (like static assets)
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }
  
  // Create a request context with a unique ID and start time
  const requestContext = createRequestContext();
  
  // Log the start of the request
  logger.debug(`Middleware processing: ${request.method} ${pathname}`, 'middleware');
  
  try {
    // Process the request with the request context
    return await runWithRequestContext(requestContext, async () => {
      // Apply rate limiting
      let rateLimitResponse = null;
  
      if (pathname.startsWith('/api/auth')) {
        rateLimitResponse = await rateLimiters.auth(request);
      } else if (pathname.startsWith('/api/qr')) {
        rateLimitResponse = await rateLimiters.qrGeneration(request);
      } else if (pathname.startsWith('/api/')) {
        rateLimitResponse = await rateLimiters.api(request);
      }
      
      // If rate limiting was triggered, return the response immediately
      if (rateLimitResponse) {
        logger.warn(`Rate limit triggered for: ${request.method} ${pathname}`, 'middleware');
        rateLimitResponse.headers.set('X-Request-ID', requestContext.requestId);
        return rateLimitResponse;
      }
      
      // Continue with the request and add security headers
      const response = NextResponse.next();
      
      // Add basic security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Add the request ID as a response header for debugging
      response.headers.set('X-Request-ID', requestContext.requestId);
      
      return response;
    });
  } catch (error) {
    // Log any errors that occur during middleware processing
    logger.error(
      `Middleware error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'middleware',
      error
    );
    
    // Continue with the request and let the application handle the error
    const response = NextResponse.next();
    response.headers.set('X-Request-ID', requestContext.requestId);
    return response;
  }
}

/**
 * Check if a path is a static asset that doesn't need database access
 */
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.ico')
  );
}

/**
 * Define which routes this middleware should run on
 */
export const config = {
  // Apply this middleware only to API routes and pages, not to static files
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Apply to all pages except static assets, images, and favicons
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 