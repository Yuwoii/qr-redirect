'use client';

import React, { useState } from 'react';

const AnalyticsDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'standard' | 'swiss'>('standard');

  const toggleView = () => {
    setCurrentView(currentView === 'standard' ? 'swiss' : 'standard');
  };
  
  // Define color schemes for Swiss engagement section consistent with analytics
  const timeColors = {
    morning: "bg-amber-500",    // Morning - amber/yellow like sunrise
    afternoon: "bg-orange-500", // Afternoon - orange like midday sun
    evening: "bg-violet-600",   // Evening - violet/purple like sunset
    night: "bg-indigo-800"      // Night - dark blue/indigo like night sky
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
              <p className="text-xs text-gray-500">Special focus on Swiss visitors</p>
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
          
          {/* Primary Languages Used */}
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-xs text-gray-500">
              <span>Primary Language Used</span>
              <span>Based on visitor browser settings</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { lang: "German", percent: 65, color: "bg-blue-600" },
                { lang: "French", percent: 22, color: "bg-red-600" },
                { lang: "Italian", percent: 8, color: "bg-green-600" },
                { lang: "English", percent: 5, color: "bg-yellow-600" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col p-2 border rounded bg-white">
                  <span className="text-xs font-medium">{item.lang}</span>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 my-1">
                    <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                  <span className="text-[10px]">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Urban vs Rural and Time of Day */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border rounded p-3 bg-white">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Urban vs. Rural Distribution</h5>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-sky-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                </div>
                <div className="ml-2 min-w-[60px] text-xs">
                  72% Urban
                </div>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "28%" }}></div>
                </div>
                <div className="ml-2 min-w-[60px] text-xs">
                  28% Rural
                </div>
              </div>
            </div>
            
            <div className="border rounded p-3 bg-white">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Traffic by Time of Day</h5>
              <div className="space-y-1">
                {[
                  { time: "Morning (6-12)", percent: 32, color: timeColors.morning },
                  { time: "Afternoon (12-18)", percent: 45, color: timeColors.afternoon },
                  { time: "Evening (18-24)", percent: 18, color: timeColors.evening },
                  { time: "Night (0-6)", percent: 5, color: timeColors.night }
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2/5 text-[10px] truncate">{item.time}</div>
                    <div className="w-3/5 pl-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`${item.color} h-1.5 rounded-full`} 
                          style={{ width: `${item.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Canton Distribution */}
          <div className="mb-4">
            <h5 className="text-xs font-medium text-gray-700 mb-2">Top Cantons</h5>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Zürich (ZH)", percent: 28, visits: 568 },
                { name: "Bern (BE)", percent: 15, visits: 312 },
                { name: "Geneva (GE)", percent: 13, visits: 265 },
                { name: "Vaud (VD)", percent: 11, visits: 218 },
                { name: "Basel-Stadt (BS)", percent: 8, visits: 162 },
                { name: "Ticino (TI)", percent: 7, visits: 143 }
              ].map((canton, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded bg-white">
                  <div className="text-xs">{canton.name}</div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium">{canton.visits}</span>
                    <span className="text-[10px] text-gray-500">{canton.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsDashboard; 