'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface BarChartDataPoint {
  date: string;
  count: number;
  label?: string;
}

interface TooltipProps {
  visible: boolean;
  content: React.ReactNode;
  position: { x: number; y: number };
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  barSpacing?: number;
  barWidth?: string;
  className?: string;
  tooltipClassName?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showTooltip?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ visible, content, position }) => {
  if (!visible) return null;
  
  return (
    <div 
      className="absolute z-10 bg-white shadow-lg rounded p-2 text-xs text-gray-800 border border-gray-200 whitespace-nowrap"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y - 40}px`,
        transform: 'translateX(-50%)'
      }}
    >
      {content}
    </div>
  );
};

export function BarChart({
  data,
  height = 150,
  barSpacing = 2,
  barWidth = "flex-1",
  className,
  tooltipClassName,
  gradientFrom = "from-indigo-600",
  gradientTo = "to-purple-500",
  showTooltip = true,
}: BarChartProps) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: React.ReactNode;
    position: { x: number; y: number };
  }>({
    visible: false,
    content: null,
    position: { x: 0, y: 0 },
  });

  // Find the maximum value to normalize heights
  const maxValue = Math.max(...data.map(item => item.count), 1);
  
  const handleBarMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    item: BarChartDataPoint
  ) => {
    if (!showTooltip) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    
    setTooltip({
      visible: true,
      content: (
        <div>
          <div className="font-medium">{item.date}</div>
          <div>{item.count} {item.count === 1 ? 'scan' : 'scans'}</div>
          {item.label && <div>{item.label}</div>}
        </div>
      ),
      position: { x: x, y: y }
    });
  };

  const handleBarMouseLeave = () => {
    if (!showTooltip) return;
    setTooltip({ ...tooltip, visible: false });
  };

  return (
    <div className={cn("relative", className)} style={{ height: `${height}px` }}>
      {/* Chart Background Grid */}
      <div className="absolute inset-0 grid grid-cols-7 grid-rows-4">
        {Array(28).fill(0).map((_, i) => (
          <div key={i} className="border-b border-r border-gray-100"></div>
        ))}
      </div>
      
      {/* Bars */}
      <div className="absolute inset-0 flex items-end">
        {data.map((item, index) => (
          <div 
            key={index} 
            className={cn(barWidth, `mx-${barSpacing/2}`)}
            onMouseEnter={e => handleBarMouseEnter(e, item)}
            onMouseLeave={handleBarMouseLeave}
          >
            <div 
              className={`bg-gradient-to-t ${gradientFrom} ${gradientTo} rounded-t transition-all duration-300 hover:opacity-80`} 
              style={{ 
                height: `${(item.count / maxValue) * 100}%`,
                minHeight: item.count > 0 ? '4px' : '0'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Tooltip */}
      <Tooltip 
        visible={tooltip.visible}
        content={tooltip.content}
        position={tooltip.position}
      />
    </div>
  );
} 