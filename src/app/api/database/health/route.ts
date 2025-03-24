import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import logger from "@/lib/logger";

/**
 * Database health check endpoint
 * This is a simplified health check specifically for the database
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const prisma = new PrismaClient();
  
  try {
    // Execute a simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1 as test`;
    
    const responseTimeMs = Date.now() - startTime;
    
    // Return a healthy response
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTimeMs,
      database: {
        type: "sqlite",
        status: "connected"
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    const dbError = error instanceof Error ? error : new Error(String(error));
    
    // Log the error
    logger.error(
      `Database health check failed: ${dbError.message}`, 
      'database/health',
      dbError
    );
    
    // Return an unhealthy response
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      responseTimeMs,
      error: dbError.message
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } finally {
    // Always disconnect the Prisma client
    await prisma.$disconnect();
  }
} 