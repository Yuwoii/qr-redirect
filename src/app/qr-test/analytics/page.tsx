'use client';

import React from 'react';
import { EnhancedAnalyticsDashboard } from "@/components/EnhancedAnalyticsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AnalyticsTestPage() {
  // Sample data for testing
  const totalScans = 3247;
  const qrCodeId = "test-qr-code-id";
  
  // Mock device data
  const deviceData = {
    mobile: Math.floor(totalScans * 0.68),  // 68% mobile
    desktop: Math.floor(totalScans * 0.27), // 27% desktop  
    tablet: Math.floor(totalScans * 0.05),  // 5% tablet
  };
  
  // Mock location data
  const locationData = {
    "Switzerland": Math.floor(totalScans * 0.62),
    "Germany": Math.floor(totalScans * 0.14),
    "France": Math.floor(totalScans * 0.09),
    "Italy": Math.floor(totalScans * 0.06),
    "Austria": Math.floor(totalScans * 0.04),
    "United States": Math.floor(totalScans * 0.03),
    "Other": Math.floor(totalScans * 0.02),
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-indigo-700 hover:text-indigo-800 font-medium">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analytics Dashboard Test Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              This page demonstrates the enhanced analytics dashboard with test data.
              The dashboard includes:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-500 pl-4">
              <li>Interactive "Scans by Day" graph with hover details</li>
              <li>Time span selector (day, week, month, year, all)</li>
              <li>Device breakdown</li>
              <li>Geographic data visualization</li>
              <li>Responsive design for all device sizes</li>
            </ul>
          </CardContent>
        </Card>
        
        <EnhancedAnalyticsDashboard
          qrCodeId={qrCodeId}
          totalScans={totalScans}
          deviceData={deviceData}
          locationData={locationData}
        />
      </div>
    </div>
  );
} 