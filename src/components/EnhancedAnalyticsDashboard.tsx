'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanAnalytics } from './ScanAnalytics';
import { 
  Users, Globe, Smartphone, 
  Clock, Calendar, BarChart3, 
  ArrowUpRight, Laptop, RefreshCcw
} from 'lucide-react';

interface AnalyticsProps {
  qrCodeId?: string;
  totalScans?: number;
  deviceData?: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  locationData?: Record<string, number>;
}

export function EnhancedAnalyticsDashboard({
  qrCodeId,
  totalScans = 0,
  deviceData = { mobile: 0, desktop: 0, tablet: 0 },
  locationData = {}
}: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate device percentages
  const totalDevices = deviceData.mobile + deviceData.desktop + deviceData.tablet;
  const devicePercentages = {
    mobile: totalDevices > 0 ? Math.round((deviceData.mobile / totalDevices) * 100) : 0,
    desktop: totalDevices > 0 ? Math.round((deviceData.desktop / totalDevices) * 100) : 0,
    tablet: totalDevices > 0 ? Math.round((deviceData.tablet / totalDevices) * 100) : 0
  };
  
  // Get top locations
  const topLocations = Object.entries(locationData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Calculate total from top locations and compute percentages
  const topLocationsTotal = topLocations.reduce((sum, [_, count]) => sum + count, 0);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="devices" className="text-sm">Devices</TabsTrigger>
            <TabsTrigger value="geography" className="text-sm">Geography</TabsTrigger>
          </TabsList>
          <button 
            className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="w-3 h-3 mr-1" />
            Refresh Data
          </button>
        </div>
        
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalScans}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Device Split</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{devicePercentages.mobile}%</div>
                <p className="text-xs text-muted-foreground">Mobile users</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Top Location</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {topLocations.length > 0 ? topLocations[0][0] : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {topLocations.length > 0 
                    ? `${Math.round((topLocations[0][1] / topLocationsTotal) * 100)}% of all scans` 
                    : 'No location data available'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <ScanAnalytics 
            qrCodeId={qrCodeId} 
            totalScans={totalScans} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Locations</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {topLocations.length > 0 ? (
                  <div className="space-y-2">
                    {topLocations.map(([location, count]) => (
                      <div key={location} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm">{location}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({Math.round((count / topLocationsTotal) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No location data available</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Smartphone className="w-4 h-4 mr-2 text-indigo-600" />
                        <span className="text-sm">Mobile</span>
                      </div>
                      <div className="text-sm font-medium">
                        {deviceData.mobile} ({devicePercentages.mobile}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full" 
                        style={{ width: `${devicePercentages.mobile}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Laptop className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm">Desktop</span>
                      </div>
                      <div className="text-sm font-medium">
                        {deviceData.desktop} ({devicePercentages.desktop}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${devicePercentages.desktop}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Laptop className="w-4 h-4 mr-2 text-emerald-600" />
                        <span className="text-sm">Tablet</span>
                      </div>
                      <div className="text-sm font-medium">
                        {deviceData.tablet} ({devicePercentages.tablet}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-emerald-600 h-1.5 rounded-full" 
                        style={{ width: `${devicePercentages.tablet}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="devices" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Add more detailed device analytics here in the future */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Device Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  More detailed device analytics coming soon. This will include browser breakdowns, 
                  operating systems, and device models.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="geography" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Add more detailed geography analytics here in the future */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Geography Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  More detailed geography analytics coming soon. This will include regional breakdowns,
                  city-level data, and interactive maps.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 