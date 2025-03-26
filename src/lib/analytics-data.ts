import { format, subDays, eachDayOfInterval } from 'date-fns';
import { BarChartDataPoint } from "@/components/ui/bar-chart";

// Types and interfaces
export interface ScanData {
  date: string;
  count: number;
}

export interface DeviceData {
  mobile: number;
  desktop: number;
  tablet: number;
  browser?: {
    chrome: number;
    safari: number;
    firefox: number;
    edge: number;
    opera: number;
    other: number;
  };
  os?: {
    windows: number;
    macos: number;
    ios: number;
    android: number;
    linux: number;
    other: number;
  };
}

export interface AnalyticsData {
  totalScans: number;
  scansByDate: ScanData[];
  devices: DeviceData;
  previousPeriodChange?: number; // percentage change compared to previous period
}

export type TimeSpan = 'day' | 'week' | 'month' | 'year' | 'all';

// Helper functions
export function generateDateRange(timeSpan: TimeSpan): { start: Date, end: Date } {
  const end = new Date();
  let start: Date;
  
  switch (timeSpan) {
    case 'day':
      start = subDays(end, 1);
      break;
    case 'week':
      start = subDays(end, 7);
      break;
    case 'month':
      start = subDays(end, 30);
      break;
    case 'year':
      start = subDays(end, 365);
      break;
    case 'all':
    default:
      // For demo purposes, "all" is last 2 years
      start = subDays(end, 730);
      break;
  }
  
  return { start, end };
}

export function formatDateRange(timeSpan: TimeSpan): string {
  const { start, end } = generateDateRange(timeSpan);
  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
}

/**
 * Generates an array of dates for the specified time span
 */
export function generateDateRangeArray(timeSpan: TimeSpan): Date[] {
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
      return format(date, 'HH:mm');
    case 'week':
      return format(date, 'EEE');
    case 'month':
      return format(date, 'MMM d');
    case 'year':
      return format(date, 'MMM');
    case 'all':
      return format(date, 'MMM yyyy');
    default:
      return format(date, 'MMM d');
  }
}

// Generate sample data for testing
export function generateSampleScanData(timeSpan: TimeSpan): ScanData[] {
  const { start, end } = generateDateRange(timeSpan);
  const days = eachDayOfInterval({ start, end });
  
  return days.map((day: Date) => {
    // Generate random scan count, more recent days tend to have more scans
    const dayIndex = days.indexOf(day);
    const daysTotal = days.length;
    const baseScan = Math.floor(Math.random() * 150) + 50;
    const trendFactor = 1 + (dayIndex / daysTotal) * 0.5; // Recent days get up to 50% more scans
    
    return {
      date: format(day, 'yyyy-MM-dd'),
      count: Math.floor(baseScan * trendFactor)
    };
  });
}

export function calculateTotalScans(scansByDate: ScanData[]): number {
  return scansByDate.reduce((total, day) => total + day.count, 0);
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 100; // If previous was 0, consider it 100% increase
  return Math.round(((current - previous) / previous) * 100);
}

export function getSampleData(timeSpan: TimeSpan): AnalyticsData {
  // Generate sample scan data for the requested time period
  const scansByDate = generateSampleScanData(timeSpan);
  const totalScans = calculateTotalScans(scansByDate);
  
  // Calculate data for the previous period to show percentage change
  let previousPeriodChange: number | undefined;
  
  // Only calculate for non-"all" time spans
  if (timeSpan !== 'all') {
    // Generate sample data for the previous equivalent time period
    const { start, end } = generateDateRange(timeSpan);
    const periodLength = end.getTime() - start.getTime();
    
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(end.getTime() - periodLength);
    
    const previousDays = eachDayOfInterval({ start: previousStart, end: previousEnd });
    const previousScans = previousDays.map((day: Date) => {
      const baseScan = Math.floor(Math.random() * 120) + 40; // Slightly lower baseline
      return {
        date: format(day, 'yyyy-MM-dd'),
        count: baseScan
      };
    });
    
    const previousTotal = calculateTotalScans(previousScans);
    previousPeriodChange = calculatePercentageChange(totalScans, previousTotal);
  }
  
  // Sample device data
  const devices: DeviceData = {
    mobile: Math.floor(Math.random() * 5000) + 3000,
    desktop: Math.floor(Math.random() * 4000) + 2000,
    tablet: Math.floor(Math.random() * 1500) + 500,
    browser: {
      chrome: Math.floor(Math.random() * 4000) + 3000,
      safari: Math.floor(Math.random() * 2000) + 1500,
      firefox: Math.floor(Math.random() * 1000) + 500,
      edge: Math.floor(Math.random() * 800) + 300,
      opera: Math.floor(Math.random() * 400) + 100,
      other: Math.floor(Math.random() * 300) + 50,
    },
    os: {
      windows: Math.floor(Math.random() * 3000) + 2000,
      macos: Math.floor(Math.random() * 2000) + 1000,
      ios: Math.floor(Math.random() * 2500) + 1500,
      android: Math.floor(Math.random() * 2500) + 1500,
      linux: Math.floor(Math.random() * 500) + 100,
      other: Math.floor(Math.random() * 200) + 50,
    }
  };

  return {
    totalScans,
    devices,
    scansByDate,
    previousPeriodChange
  };
}

// Function to fetch real analytics data (to be implemented with actual API)
export async function fetchAnalyticsData(qrCodeId: string, timeSpan: TimeSpan): Promise<AnalyticsData> {
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
      // For now, return sample data
      resolve(getSampleData(timeSpan));
    }, 500); // Simulate network delay
  });
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
  
  const dates = generateDateRangeArray(timeSpan);
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