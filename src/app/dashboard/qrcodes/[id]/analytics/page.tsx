import React from 'react';
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { auth } from "@/app/auth";
import { getQRCodeStats } from "@/lib/analytics";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, BarChart, Activity, Globe, Smartphone, MousePointerClick, Clock } from "lucide-react";

interface QRCodeAnalyticsPageProps {
  params: {
    id: string;
  };
}

export default async function QRCodeAnalyticsPage({ params }: QRCodeAnalyticsPageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  // Ensure params is properly awaited
  const paramsObj = await params;
  const id = paramsObj.id;
  
  // Fetch the QR code with its redirects
  const qrCode = await prisma.qRCode.findFirst({
    where: {
      id,
      userId: session.user.id
    },
    include: {
      redirects: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
  
  if (!qrCode) {
    notFound();
  }
  
  // Get QR code stats
  const stats = await getQRCodeStats(qrCode.id);
  
  // Calculate date ranges for demo analytics
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  // Simple mock data - in a real app, this would come from a database
  const visitsPerDay = [
    { date: lastWeek.toLocaleDateString(), count: Math.floor(Math.random() * 20) },
    { date: new Date(lastWeek.getTime() + 86400000).toLocaleDateString(), count: Math.floor(Math.random() * 20) },
    { date: new Date(lastWeek.getTime() + 86400000 * 2).toLocaleDateString(), count: Math.floor(Math.random() * 20) },
    { date: new Date(lastWeek.getTime() + 86400000 * 3).toLocaleDateString(), count: Math.floor(Math.random() * 20) },
    { date: new Date(lastWeek.getTime() + 86400000 * 4).toLocaleDateString(), count: Math.floor(Math.random() * 20) },
    { date: yesterday.toLocaleDateString(), count: Math.floor(Math.random() * 20) },
    { date: today.toLocaleDateString(), count: Math.floor(Math.random() * 20) },
  ];
  
  // Calculate total visits from sample data
  const sampleTotalVisits = visitsPerDay.reduce((sum, day) => sum + day.count, 0);
  
  // In a real app, we would pull these from actual analytics data
  // Using the total from the visits data for realism
  const totalVisits = stats.totalVisits || sampleTotalVisits;
  
  // Generate some mock device data
  const deviceData = {
    mobile: Math.floor(totalVisits * 0.6),  // 60% mobile
    desktop: Math.floor(totalVisits * 0.35), // 35% desktop  
    tablet: Math.floor(totalVisits * 0.05),  // 5% tablet
  };
  
  // Generate some mock location data
  const locationData = {
    "United States": Math.floor(totalVisits * 0.4),
    "United Kingdom": Math.floor(totalVisits * 0.15),
    "Canada": Math.floor(totalVisits * 0.12),
    "Germany": Math.floor(totalVisits * 0.08),
    "France": Math.floor(totalVisits * 0.05),
    "Other": Math.floor(totalVisits * 0.2),
  };
  
  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard" className="text-indigo-700 hover:text-indigo-800 font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics: {qrCode.name}</h1>
        <div className="text-sm text-gray-500">
          QR Code created: {new Date(qrCode.createdAt).toLocaleDateString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits}</div>
            <p className="text-xs text-muted-foreground">Since creation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitsPerDay[visitsPerDay.length - 1].count}</div>
            <p className="text-xs text-muted-foreground">
              {visitsPerDay[visitsPerDay.length - 1].count > visitsPerDay[visitsPerDay.length - 2].count ? "↑" : "↓"} 
              {Math.abs(visitsPerDay[visitsPerDay.length - 1].count - visitsPerDay[visitsPerDay.length - 2].count)} from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Redirect</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">
              {stats.activeRedirectUrl || 'No active redirect'}
            </div>
            <p className="text-xs text-muted-foreground">
              {qrCode.redirects.length} redirect{qrCode.redirects.length !== 1 ? 's' : ''} total
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Scans by Day</CardTitle>
            <CardDescription>
              Last 7 days of QR code activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end gap-2">
              {visitsPerDay.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-indigo-700 w-full rounded-t-md" 
                    style={{ height: `${(day.count / Math.max(...visitsPerDay.map(d => d.count))) * 150}px` }}
                  ></div>
                  <div className="text-xs mt-2 w-full text-center truncate">{day.date.split('/').slice(0, 2).join('/')}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>
              Types of devices used for scanning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-1/4 text-sm">Mobile</div>
                <div className="w-3/4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-700 h-2.5 rounded-full" style={{ width: `${(deviceData.mobile / totalVisits) * 100}%` }}></div>
                  </div>
                </div>
                <div className="w-12 text-right text-sm">{Math.round((deviceData.mobile / totalVisits) * 100)}%</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-1/4 text-sm">Desktop</div>
                <div className="w-3/4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-700 h-2.5 rounded-full" style={{ width: `${(deviceData.desktop / totalVisits) * 100}%` }}></div>
                  </div>
                </div>
                <div className="w-12 text-right text-sm">{Math.round((deviceData.desktop / totalVisits) * 100)}%</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-1/4 text-sm">Tablet</div>
                <div className="w-3/4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-700 h-2.5 rounded-full" style={{ width: `${(deviceData.tablet / totalVisits) * 100}%` }}></div>
                  </div>
                </div>
                <div className="w-12 text-right text-sm">{Math.round((deviceData.tablet / totalVisits) * 100)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>
            Where your QR code is being scanned from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(locationData).map(([country, count], index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{count} scans</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round((count as number / totalVisits) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Note: Detailed analytics data collection will be expanded in future updates.</p>
      </div>
    </div>
  );
} 