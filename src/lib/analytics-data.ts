import { BarChartDataPoint } from "@/components/ui/bar-chart";
import { TimeSpan } from "@/components/ui/time-filter";

/**
 * Generates an array of dates for the specified time span
 */
export function generateDateRange(timeSpan: TimeSpan): Date[] {
  const today = new Date();
  const dates: Date[] = [];
  
  switch (timeSpan) {
    case 'day':
      // For a day, we show hourly data (last 24 hours)
      for (let i = 23; i >= 0; i--) {
        const date = new Date(today);
        date.setHours(today.getHours() - i);
        date.setMinutes(0, 0, 0); // Reset minutes, seconds, and milliseconds
        dates.push(date);
      }
      break;
      
    case 'week':
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0); // Start of day
        dates.push(date);
      }
      break;
      
    case 'month':
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        dates.push(date);
      }
      break;
      
    case 'year':
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        date.setDate(1); // First day of the month
        date.setHours(0, 0, 0, 0);
        dates.push(date);
      }
      break;
      
    case 'all':
      // Show by months for the last 2 years
      for (let i = 23; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        dates.push(date);
      }
      break;
  }
  
  return dates;
}

/**
 * Formats a date based on the time span
 */
export function formatDateForTimeSpan(date: Date, timeSpan: TimeSpan): string {
  switch (timeSpan) {
    case 'day':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'week':
      return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
    case 'month':
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case 'year':
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    case 'all':
      return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Generates chart data points for a specific time span
 * This is a placeholder function that would be replaced with actual data fetching
 */
export function generateScanDataForTimeSpan(
  timeSpan: TimeSpan, 
  totalScans: number = 0,
  qrCodeId?: string
): BarChartDataPoint[] {
  // In a real app, we would fetch this data from an API based on qrCodeId
  // For now, we'll generate some plausible example data
  
  const dates = generateDateRange(timeSpan);
  const baseValue = Math.max(1, Math.floor(totalScans / dates.length / 2));
  
  return dates.map((date, index) => {
    // Generate some realistic looking data
    // More recent dates tend to have more scans
    const recencyFactor = index / dates.length; // 0 for oldest, 1 for newest
    const randomFactor = 0.5 + Math.random(); // Random between 0.5 and 1.5
    const weekendBoost = [0, 6].includes(date.getDay()) ? 1.2 : 1; // Weekend boost
    
    // Hourly patterns for daily view
    let timeOfDayFactor = 1;
    if (timeSpan === 'day') {
      const hour = date.getHours();
      if (hour >= 9 && hour <= 17) {
        timeOfDayFactor = 1.5; // Business hours boost
      } else if (hour >= 18 && hour <= 22) {
        timeOfDayFactor = 1.3; // Evening boost
      } else if (hour >= 0 && hour <= 5) {
        timeOfDayFactor = 0.3; // Late night reduction
      }
    }
    
    const count = Math.floor(
      baseValue * (1 + recencyFactor) * randomFactor * weekendBoost * timeOfDayFactor
    );
    
    return {
      date: formatDateForTimeSpan(date, timeSpan),
      count
    };
  });
}

/**
 * Get the total scans for a specific time span
 */
export function calculateTotalScansForTimeSpan(data: BarChartDataPoint[]): number {
  return data.reduce((total, point) => total + point.count, 0);
}

/**
 * Get the percentage change compared to the previous equivalent time span
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
} 