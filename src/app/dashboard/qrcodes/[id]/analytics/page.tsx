import React from 'react';
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { auth } from "@/app/auth";
import { getQRCodeStats } from "@/lib/analytics";
import { EnhancedAnalyticsDashboard } from "@/components/EnhancedAnalyticsDashboard";

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
  const globalLocationData = {
    "Switzerland": Math.floor(totalVisits * 0.65), // 65% Switzerland as main country
    "Germany": Math.floor(totalVisits * 0.12),
    "France": Math.floor(totalVisits * 0.08),
    "Italy": Math.floor(totalVisits * 0.05),
    "Austria": Math.floor(totalVisits * 0.04),
    "United States": Math.floor(totalVisits * 0.03),
    "Other": Math.floor(totalVisits * 0.03),
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
      
      {/* Replace the old analytics dashboard with our enhanced one */}
      <EnhancedAnalyticsDashboard
        qrCodeId={qrCode.id}
        totalScans={totalVisits}
        deviceData={deviceData}
        locationData={globalLocationData}
      />
    </div>
  );
} 