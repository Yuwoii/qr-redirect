'use client';

import React, { useState } from 'react';

const AnalyticsDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'standard' | 'swiss'>('standard');

  const toggleView = () => {
    setCurrentView(currentView === 'standard' ? 'swiss' : 'standard');
  };

  return (
    <>
      <button 
        onClick={toggleView}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-r-lg shadow-md p-2 z-10 text-gray-500 hover:text-indigo-600 transition-colors" 
        aria-label="Previous analytics view"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <button 
        onClick={toggleView}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-l-lg shadow-md p-2 z-10 text-gray-500 hover:text-indigo-600 transition-colors" 
        aria-label="Next analytics view"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      
      {currentView === 'standard' ? (
        <div className="pl-6 pr-6">
          {/* Dashboard Header - Standard View */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-semibold text-gray-800">Analytics Overview</h4>
              <p className="text-xs text-gray-500">Real-time insights from your QR codes</p>
            </div>
            <div className="flex space-x-2">
              <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                Last 30 days
              </div>
              <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                All Data
              </div>
            </div>
          </div>
          
          {/* Main Chart - Standard View */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Scans</span>
              <span>May 2025</span>
            </div>
            <div className="h-32 bg-white rounded-lg flex-1 relative">
              {/* Chart Background Grid */}
              <div className="absolute inset-0 grid grid-cols-7 grid-rows-4">
                {Array(28).fill(0).map((_, i) => (
                  <div key={i} className="border-b border-r border-gray-100"></div>
                ))}
              </div>
              
              {/* Chart Data */}
              <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end">
                {[15, 22, 18, 26, 12, 28, 19, 25, 30, 22, 15, 20, 24, 19, 14, 22, 26, 32, 29, 24, 18, 24, 28, 30, 34, 28, 26, 29, 31].map((value, index) => (
                  <div 
                    key={index} 
                    className="flex-1 mx-0.5 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t" 
                    style={{ height: `${(value / 35) * 100}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Stats Grid - Standard View */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-lg font-bold text-indigo-700">3,247</div>
              <div className="text-xs text-gray-500">Total Scans</div>
              <div className="text-xs text-green-600 mt-1">+12.5% ↑</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-lg font-bold text-indigo-700">42</div>
              <div className="text-xs text-gray-500">Countries</div>
              <div className="text-xs text-green-600 mt-1">+3 new ↑</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-lg font-bold text-indigo-700">72%</div>
              <div className="text-xs text-gray-500">Mobile</div>
              <div className="text-xs text-gray-500 mt-1">28% Desktop</div>
            </div>
          </div>
          
          {/* Secondary Data - Standard View */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Top Locations</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>United States</span>
                  <span className="font-medium">42%</span>
                </div>
                <div className="flex justify-between">
                  <span>United Kingdom</span>
                  <span className="font-medium">18%</span>
                </div>
                <div className="flex justify-between">
                  <span>Germany</span>
                  <span className="font-medium">12%</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Device Breakdown</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>iPhone</span>
                  <span className="font-medium">38%</span>
                </div>
                <div className="flex justify-between">
                  <span>Android</span>
                  <span className="font-medium">34%</span>
                </div>
                <div className="flex justify-between">
                  <span>Windows</span>
                  <span className="font-medium">22%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pl-6 pr-6">
          {/* Dashboard Header - Swiss Engagement System */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-semibold text-gray-800">Swiss Engagement System</h4>
              <p className="text-xs text-gray-500">Advanced user engagement metrics</p>
            </div>
            <div className="flex space-x-2">
              <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                Last Quarter
              </div>
              <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                Year to Date
              </div>
            </div>
          </div>
          
          {/* Engagement Metrics */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Engagement Score</span>
              <span>Q2 2025</span>
            </div>
            <div className="h-32 bg-white rounded-lg flex-1 relative overflow-hidden">
              {/* Engagement Meter */}
              <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-green-500 to-green-300 opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800">87.3</div>
                  <div className="text-xs text-gray-500">Excellent</div>
                </div>
              </div>
              
              {/* Radial Progress Indicators */}
              <div className="absolute top-2 left-2 w-10 h-10 rounded-full border-4 border-green-500 flex items-center justify-center">
                <span className="text-xs font-medium">92%</span>
              </div>
              <div className="absolute top-2 right-2 w-10 h-10 rounded-full border-4 border-blue-500 flex items-center justify-center">
                <span className="text-xs font-medium">85%</span>
              </div>
              <div className="absolute bottom-2 left-2 w-10 h-10 rounded-full border-4 border-yellow-500 flex items-center justify-center">
                <span className="text-xs font-medium">78%</span>
              </div>
              <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full border-4 border-purple-500 flex items-center justify-center">
                <span className="text-xs font-medium">89%</span>
              </div>
            </div>
          </div>
          
          {/* Channel Performance */}
          <div className="mb-4">
            <h5 className="text-xs font-medium text-gray-700 mb-2">Channel Performance</h5>
            <div className="space-y-2">
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                  <span>Direct Scan</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                  <span>Social Media</span>
                  <span className="font-medium">64%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                  <span>Print Material</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Engagement KPIs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="text-xs font-medium text-gray-700 mb-2">User Retention</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Repeat Visits</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex justify-between">
                  <span>Session Duration</span>
                  <span className="font-medium">4m 32s</span>
                </div>
                <div className="flex justify-between">
                  <span>Bounce Rate</span>
                  <span className="font-medium">17.8%</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Conversion Metrics</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Goal Completion</span>
                  <span className="font-medium">28.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Interaction Rate</span>
                  <span className="font-medium">73.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Acquisition Cost</span>
                  <span className="font-medium">$1.24</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsDashboard; 