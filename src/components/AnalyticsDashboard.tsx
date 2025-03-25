'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data for charts
const scanData = [
  { name: 'Jan', scans: 400 },
  { name: 'Feb', scans: 300 },
  { name: 'Mar', scans: 600 },
  { name: 'Apr', scans: 800 },
  { name: 'May', scans: 750 },
  { name: 'Jun', scans: 900 },
];

const swissData = [
  { name: 'Jan', engagement: 65 },
  { name: 'Feb', engagement: 59 },
  { name: 'Mar', engagement: 80 },
  { name: 'Apr', engagement: 81 },
  { name: 'May', engagement: 76 },
  { name: 'Jun', engagement: 85 },
];

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('standard');

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 w-full max-w-5xl mb-12">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
      
      <Tabs defaultValue="standard" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex justify-center">
          <TabsTrigger 
            value="standard"
            className={`px-4 py-2 rounded-md mr-2 ${activeTab === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Analytics Overview
          </TabsTrigger>
          <TabsTrigger 
            value="swiss"
            className={`px-4 py-2 rounded-md ${activeTab === 'swiss' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Swiss Engagement System
          </TabsTrigger>
        </TabsList>

        {activeTab === 'standard' && (
          <div className="space-y-6">
            <div className="h-64 bg-gray-50 rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">Scan Activity</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart
                  data={scanData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="scans" stroke="#3b82f6" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Total Scans</h3>
                <p className="text-3xl font-bold text-blue-600">3,750</p>
                <p className="text-sm text-gray-500">+12% from last month</p>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Countries</h3>
                <p className="text-3xl font-bold text-green-600">24</p>
                <p className="text-sm text-gray-500">+3 new countries</p>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Unique Visitors</h3>
                <p className="text-3xl font-bold text-purple-600">1,890</p>
                <p className="text-sm text-gray-500">50.4% of total scans</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Top Locations</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>United States</span>
                    <span className="font-medium">42%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Germany</span>
                    <span className="font-medium">18%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>United Kingdom</span>
                    <span className="font-medium">15%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Japan</span>
                    <span className="font-medium">9%</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Device Breakdown</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Mobile</span>
                    <span className="font-medium">68%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Desktop</span>
                    <span className="font-medium">27%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tablet</span>
                    <span className="font-medium">5%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'swiss' && (
          <div className="space-y-6">
            <div className="h-64 bg-gray-50 rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">Engagement Metrics</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart
                  data={swissData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement" stroke="#10b981" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-md p-4 border-l-4 border-green-500">
                <h3 className="text-lg font-medium mb-2">Engagement Score</h3>
                <p className="text-3xl font-bold text-green-600">74.3</p>
                <p className="text-sm text-gray-500">+5.2 from baseline</p>
              </div>
              <div className="bg-gray-50 rounded-md p-4 border-l-4 border-yellow-500">
                <h3 className="text-lg font-medium mb-2">Retention Rate</h3>
                <p className="text-3xl font-bold text-yellow-600">62%</p>
                <p className="text-sm text-gray-500">+3% from last quarter</p>
              </div>
              <div className="bg-gray-50 rounded-md p-4 border-l-4 border-blue-500">
                <h3 className="text-lg font-medium mb-2">Conversion Rate</h3>
                <p className="text-3xl font-bold text-blue-600">8.7%</p>
                <p className="text-sm text-gray-500">Industry avg: 5.2%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Channel Performance</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span>Direct Scan</span>
                    <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Social Media</span>
                    <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Email Campaign</span>
                    <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Print Media</span>
                    <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Audience Segments</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>New Visitors</span>
                    <span className="font-medium text-red-500">32%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Returning Visitors</span>
                    <span className="font-medium text-yellow-500">41%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Loyal Customers</span>
                    <span className="font-medium text-green-500">27%</span>
                  </li>
                </ul>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Swiss Engagement System shows a healthy distribution of audience segments, with strong retention rates in the loyal customer category.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
} 