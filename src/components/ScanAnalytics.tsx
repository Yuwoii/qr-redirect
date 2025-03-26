'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, BarChartDataPoint } from '@/components/ui/bar-chart';
import { TimeFilter, TimeSpan } from '@/components/ui/time-filter';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { 
  generateScanDataForTimeSpan, 
  calculateTotalScansForTimeSpan,
  calculatePercentageChange
} from '@/lib/analytics-data';

interface ScanAnalyticsProps {
  qrCodeId?: string;
  totalScans?: number;
}

export function ScanAnalytics({ qrCodeId, totalScans = 0 }: ScanAnalyticsProps) {
  const [timeSpan, setTimeSpan] = useState<TimeSpan>('week');
  const [chartData, setChartData] = useState<BarChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    change: 0,
    previousTotal: 0
  });
  
  // Load scan data when timeSpan changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, we would fetch this data from an API
        // For now we're using mock data
        const data = generateScanDataForTimeSpan(timeSpan, totalScans, qrCodeId);
        setChartData(data);
        
        // Calculate stats for current period
        const currentTotal = calculateTotalScansForTimeSpan(data);
        
        // Generate previous period data for comparison
        const previousData = generateScanDataForTimeSpan(timeSpan, totalScans * 0.85, qrCodeId);
        const previousTotal = calculateTotalScansForTimeSpan(previousData);
        
        // Calculate percentage change
        const change = calculatePercentageChange(currentTotal, previousTotal);
        
        setStats({
          total: currentTotal,
          change,
          previousTotal
        });
      } catch (error) {
        console.error('Error loading scan data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [timeSpan, totalScans, qrCodeId]);
  
  // Get appropriate title based on timeSpan
  const getTimeSpanTitle = () => {
    switch (timeSpan) {
      case 'day': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'year': return 'Last 12 Months';
      case 'all': return 'All Time';
      default: return 'Scans';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-base font-medium">Scans by Day</CardTitle>
        <TimeFilter 
          value={timeSpan} 
          onChange={setTimeSpan} 
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold mr-2">{stats.total}</span>
                <span className="text-sm text-gray-500">
                  {getTimeSpanTitle()}
                </span>
                {stats.change !== 0 && (
                  <div 
                    className={`ml-2 flex items-center text-xs ${
                      stats.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stats.change > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    <span>{Math.abs(stats.change)}%</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                vs. previous period ({stats.previousTotal} scans)
              </p>
            </div>
            
            <div className="h-[200px]">
              <BarChart 
                data={chartData} 
                height={200} 
                barSpacing={1}
                gradientFrom="from-indigo-600" 
                gradientTo="to-indigo-400"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 