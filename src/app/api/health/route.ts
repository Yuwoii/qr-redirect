import { NextRequest, NextResponse } from "next/server";
import { checkDatabaseHealth } from "../../../lib/db-health";
import logger from "../../../lib/logger";

/**
 * Health check endpoint for the API
 * Returns information about the status of various system components
 */
export async function GET(request: NextRequest) {
  try {
    // Start timing the entire health check
    const startTime = Date.now();
    
    // Get database health
    const dbHealth = await checkDatabaseHealth();
    
    // Calculate API response time
    const apiResponseTime = Date.now() - startTime;
    
    // Overall status is healthy if all components are healthy
    const status = dbHealth.isHealthy ? "healthy" : "unhealthy";
    
    // Return the health status
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      apiResponseTimeMs: apiResponseTime,
      components: {
        database: {
          status: dbHealth.isHealthy ? "healthy" : "unhealthy",
          responseTimeMs: dbHealth.responseTimeMs,
          error: dbHealth.error
        }
      }
    }, {
      status: status === "healthy" ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    // Log the error
    logger.error("Health check failed", "api/health", error instanceof Error ? error : new Error(String(error)));
    
    // Return an error response
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: "Failed to perform health check"
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
} 