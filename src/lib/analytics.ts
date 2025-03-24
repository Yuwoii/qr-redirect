import { redirectRepository } from './db';
import logger from './logger';

/**
 * Interface for visit tracking data
 */
export interface VisitData {
  // ID of the redirect being visited
  redirectId: string;
  // User agent string from the client
  userAgent?: string;
  // IP address (anonymized if needed for privacy)
  ipAddress?: string;
  // Referrer URL if available
  referrer?: string;
  // Device type (desktop, mobile, tablet)
  deviceType?: string;
  // Browser name and version
  browser?: string;
  // Operating system
  os?: string;
  // Country based on geolocation (if available)
  country?: string;
}

/**
 * Track a visit to a QR code redirect
 * @param redirectId ID of the redirect that was visited
 * @param visitData Additional data about the visit
 * @returns Promise resolving to the updated visit count
 */
export async function trackVisit(
  redirectId: string,
  visitData?: Partial<VisitData>
): Promise<number> {
  try {
    logger.debug(`Tracking visit for redirect: ${redirectId}`, 'trackVisit', visitData);

    // Extract user agent details if available
    if (visitData?.userAgent) {
      // Parse user agent for future analytics use
      parseUserAgent(visitData.userAgent);
      // Currently not storing this data - will be used in future analytics implementations
    }

    // TODO: Store detailed analytics in a separate table if needed
    // For now, just increment the counter
    const updatedRedirect = await redirectRepository.incrementVisitCount(redirectId);
    
    logger.info(
      `Recorded visit for redirect ${redirectId}, new count: ${updatedRedirect.visitCount}`,
      'trackVisit'
    );
    
    return updatedRedirect.visitCount;
  } catch (error) {
    logger.error(
      `Failed to track visit for redirect ${redirectId}: ${(error as Error).message}`,
      'trackVisit',
      error as Error
    );
    
    // Return -1 to indicate an error occurred
    // Important: We don't throw here to ensure the redirect still works even if analytics fails
    return -1;
  }
}

/**
 * Get the base stats for a specific QR code
 * @param qrCodeId The ID of the QR code
 * @returns Promise resolving to total visits and active redirect
 */
export async function getQRCodeStats(qrCodeId: string): Promise<{
  totalVisits: number;
  activeRedirectUrl?: string;
}> {
  try {
    logger.debug(`Getting stats for QR code: ${qrCodeId}`, 'getQRCodeStats');
    
    // Get all redirects for this QR code
    const redirects = await redirectRepository.findByQRCode(qrCodeId);
    
    // Calculate total visits across all redirects
    const totalVisits = redirects.reduce((sum, redirect) => sum + redirect.visitCount, 0);
    
    // Find the active redirect
    const activeRedirect = redirects.find(redirect => redirect.isActive);
    
    return {
      totalVisits,
      activeRedirectUrl: activeRedirect?.url
    };
  } catch (error) {
    logger.error(
      `Failed to get stats for QR code ${qrCodeId}: ${(error as Error).message}`,
      'getQRCodeStats',
      error as Error
    );
    
    return {
      totalVisits: 0
    };
  }
}

/**
 * Extract device information from user agent string
 * This is a simple implementation - in production, consider using a library like ua-parser-js
 * @param userAgent The user agent string from the request
 * @returns Device information
 */
function parseUserAgent(userAgent: string): {
  deviceType: string;
  browser: string;
  os: string;
} {
  // Simple device detection
  const deviceType = 
    /mobile|android|iphone|ipad|ipod/i.test(userAgent) 
      ? 'mobile' 
      : 'desktop';
  
  // Simple browser detection
  let browser = 'unknown';
  if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/safari/i.test(userAgent)) browser = 'Safari';
  else if (/edge|edg/i.test(userAgent)) browser = 'Edge';
  else if (/msie|trident/i.test(userAgent)) browser = 'Internet Explorer';
  
  // Simple OS detection
  let os = 'unknown';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  
  return { deviceType, browser, os };
}

/**
 * Anonymize an IP address for privacy reasons
 * @param ip The IP address to anonymize
 * @returns Anonymized IP address
 */
export function anonymizeIp(ip: string): string {
  // For IPv4, remove the last octet
  if (ip.includes('.')) {
    const parts = ip.split('.');
    parts[parts.length - 1] = '0';
    return parts.join('.');
  }
  
  // For IPv6, remove the last 80 bits (last 5 groups)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    const anonymized = parts.slice(0, 3);
    return anonymized.join(':') + '::0';
  }
  
  return ip;
} 