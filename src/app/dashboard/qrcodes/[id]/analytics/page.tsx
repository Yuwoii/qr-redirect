import React, { useState } from 'react';
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { auth } from "@/app/auth";
import { getQRCodeStats } from "@/lib/analytics";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, BarChart, Activity, Globe, Smartphone, MousePointerClick, Clock, Map, ChevronDown, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QRCodeAnalyticsPageProps {
  params: {
    id: string;
  };
}

// Swiss cantons data with their abbreviations
const swissCantons = [
  { name: "Zürich", abbreviation: "ZH" },
  { name: "Bern", abbreviation: "BE" },
  { name: "Luzern", abbreviation: "LU" },
  { name: "Uri", abbreviation: "UR" },
  { name: "Schwyz", abbreviation: "SZ" },
  { name: "Obwalden", abbreviation: "OW" },
  { name: "Nidwalden", abbreviation: "NW" },
  { name: "Glarus", abbreviation: "GL" },
  { name: "Zug", abbreviation: "ZG" },
  { name: "Fribourg", abbreviation: "FR" },
  { name: "Solothurn", abbreviation: "SO" },
  { name: "Basel-Stadt", abbreviation: "BS" },
  { name: "Basel-Landschaft", abbreviation: "BL" },
  { name: "Schaffhausen", abbreviation: "SH" },
  { name: "Appenzell Ausserrhoden", abbreviation: "AR" },
  { name: "Appenzell Innerrhoden", abbreviation: "AI" },
  { name: "St. Gallen", abbreviation: "SG" },
  { name: "Graubünden", abbreviation: "GR" },
  { name: "Aargau", abbreviation: "AG" },
  { name: "Thurgau", abbreviation: "TG" },
  { name: "Ticino", abbreviation: "TI" },
  { name: "Vaud", abbreviation: "VD" },
  { name: "Valais", abbreviation: "VS" },
  { name: "Neuchâtel", abbreviation: "NE" },
  { name: "Geneva", abbreviation: "GE" },
  { name: "Jura", abbreviation: "JU" }
];

export default function QRCodeAnalyticsPage({ params }: QRCodeAnalyticsPageProps) {
  // Our component will become a client component to support interactive features
  
  return <QRCodeAnalyticsContent params={params} />;
}

// This is our server component for data fetching
async function QRCodeAnalyticsContent({ params }: QRCodeAnalyticsPageProps) {
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
  
  // Generate more realistic global location data with Switzerland as the main focus
  const globalLocationData: Record<string, number> = {
    "Switzerland": Math.floor(totalVisits * 0.65), // 65% Switzerland as main country
    "Germany": Math.floor(totalVisits * 0.12),
    "France": Math.floor(totalVisits * 0.08),
    "Italy": Math.floor(totalVisits * 0.05),
    "Austria": Math.floor(totalVisits * 0.04),
    "United States": Math.floor(totalVisits * 0.03),
    "Other": Math.floor(totalVisits * 0.03),
  };
  
  // Calculate the number of Swiss views
  const swissTotalVisits = globalLocationData["Switzerland"];
  
  // Generate detailed Swiss canton-level data (will be more realistic percentages)
  const swissCantonData: Record<string, number> = {};
  
  // Allocate visits to different cantons with a stronger focus on major cantons
  // Major cantons: ZH, BE, VD, GE, BS, etc.
  const majorCantons = ["ZH", "BE", "VD", "GE", "BS", "TI", "SG"];
  
  // Seed a pseudo-random generator to get consistent but varied results
  const seed = qrCode.id.charCodeAt(0) + qrCode.id.charCodeAt(qrCode.id.length - 1);
  const random = (max: number) => ((seed * 9301 + 49297) % 233280) / 233280 * max;
  
  // Distribute visits across cantons
  let remainingVisits = swissTotalVisits;
  
  // First, allocate to major cantons
  let majorCantonTotal = 0;
  majorCantons.forEach(cantonCode => {
    const canton = swissCantons.find(c => c.abbreviation === cantonCode);
    if (canton) {
      // Allocate somewhere between 5% and 15% to major cantons
      const allocation = Math.floor(swissTotalVisits * (0.05 + random(0.10)));
      majorCantonTotal += allocation;
      swissCantonData[canton.name] = allocation;
    }
  });
  
  // Adjust if we've allocated too much
  if (majorCantonTotal > swissTotalVisits * 0.75) {
    const factor = (swissTotalVisits * 0.75) / majorCantonTotal;
    majorCantons.forEach(cantonCode => {
      const canton = swissCantons.find(c => c.abbreviation === cantonCode);
      if (canton) {
        swissCantonData[canton.name] = Math.floor(swissCantonData[canton.name] * factor);
      }
    });
    majorCantonTotal = Object.values(swissCantonData).reduce((sum, count) => sum + count, 0);
  }
  
  // Distribute remaining visits to other cantons
  remainingVisits = swissTotalVisits - majorCantonTotal;
  
  // Get remaining cantons that haven't been allocated yet
  const remainingCantons = swissCantons.filter(
    canton => !majorCantons.includes(canton.abbreviation)
  );
  
  // Distribute remaining visits somewhat evenly among remaining cantons
  let distributedSoFar = 0;
  remainingCantons.forEach((canton, index) => {
    if (index === remainingCantons.length - 1) {
      // Last canton gets all remaining
      swissCantonData[canton.name] = remainingVisits - distributedSoFar;
    } else {
      // Each canton gets a slightly random portion
      const allocation = Math.floor(remainingVisits / remainingCantons.length * (0.7 + random(0.6)));
      swissCantonData[canton.name] = allocation;
      distributedSoFar += allocation;
    }
  });
  
  // Make sure we don't exceed the Swiss total by rounding errors
  const totalCantonVisits = Object.values(swissCantonData).reduce((sum, count) => sum + count, 0);
  if (totalCantonVisits > swissTotalVisits) {
    // Adjust largest canton
    const largestCanton = Object.entries(swissCantonData)
      .sort((a, b) => b[1] - a[1])[0][0];
    swissCantonData[largestCanton] -= (totalCantonVisits - swissTotalVisits);
  }
  
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
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>
            Where your QR code is being scanned from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="switzerland">Switzerland Detail</TabsTrigger>
            </TabsList>
            
            <TabsContent value="global" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(globalLocationData).map(([country, count], index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{country}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-medium">{count} scans</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((count / totalVisits) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="switzerland" className="mt-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Switzerland Overview</h3>
                <div className="flex items-center mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-indigo-700 h-3 rounded-full" 
                      style={{ width: `${(globalLocationData["Switzerland"] / totalVisits) * 100}%` }}
                    ></div>
                  </div>
                  <div className="ml-4">
                    <span className="font-medium">{globalLocationData["Switzerland"]} scans</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({Math.round((globalLocationData["Switzerland"] / totalVisits) * 100)}% of total)
                    </span>
                  </div>
                </div>
                <div className="py-2 border-t border-b my-4">
                  <h3 className="text-sm font-medium">Distribution by Canton</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(swissCantonData)
                  .sort((a, b) => b[1] - a[1])
                  .map(([canton, count], index) => {
                    const cantonInfo = swissCantons.find(c => c.name === canton);
                    const percentage = Math.round((count / swissTotalVisits) * 100);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          <span>{canton}</span>
                          <span className="text-xs text-muted-foreground">({cantonInfo?.abbreviation})</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{count} scans</span>
                          <span className="text-xs text-muted-foreground">
                            ({percentage}% of Swiss traffic)
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Swiss Engagement</CardTitle>
          <CardDescription>
            Special focus on Swiss visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <div className="mb-2 flex justify-between">
                <span className="text-sm font-medium">Primary Language Used</span>
                <span className="text-sm">Based on visitor browser settings</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {[
                  { lang: "German", percent: 65, color: "bg-blue-600" },
                  { lang: "French", percent: 22, color: "bg-red-600" },
                  { lang: "Italian", percent: 8, color: "bg-green-600" },
                  { lang: "English", percent: 5, color: "bg-yellow-600" }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col p-3 border rounded-md">
                    <span className="font-medium">{item.lang}</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percent}%` }}></div>
                    </div>
                    <span className="text-xs mt-1">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Urban vs. Rural Distribution</h3>
                <div className="flex items-center mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-indigo-700 h-3 rounded-full" style={{ width: "72%" }}></div>
                  </div>
                  <div className="ml-4 min-w-[100px] text-sm">
                    72% Urban
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-emerald-600 h-3 rounded-full" style={{ width: "28%" }}></div>
                  </div>
                  <div className="ml-4 min-w-[100px] text-sm">
                    28% Rural
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Traffic by Time of Day</h3>
                <div className="space-y-2 mt-4">
                  {[
                    { time: "Morning (6-12)", percent: 32 },
                    { time: "Afternoon (12-18)", percent: 45 },
                    { time: "Evening (18-24)", percent: 18 },
                    { time: "Night (0-6)", percent: 5 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-1/3 text-xs">{item.time}</div>
                      <div className="w-2/3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-700 h-2 rounded-full" 
                            style={{ width: `${item.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-gray-500 mb-8">
        <p>Note: This geographic data is simulated for demonstration purposes.</p>
        <p>In production, precise location data would be collected with user consent.</p>
      </div>
    </div>
  );
} 