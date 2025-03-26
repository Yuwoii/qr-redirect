'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type TimeSpan = 'day' | 'week' | 'month' | 'year' | 'all';

export interface TimeFilterProps {
  value: TimeSpan;
  onChange: (timeSpan: TimeSpan) => void;
  className?: string;
}

export function TimeFilter({
  value,
  onChange,
  className = '',
}: TimeFilterProps) {
  const timeSpans: {
    value: TimeSpan;
    label: string;
  }[] = [
    { value: 'day', label: '24h' },
    { value: 'week', label: '7d' },
    { value: 'month', label: '30d' },
    { value: 'year', label: '1y' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className={cn("inline-flex bg-gray-100 rounded-lg p-1", className)}>
      {timeSpans.map((option) => (
        <button
          key={option.value}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-colors",
            value === option.value
              ? "bg-white shadow-sm text-gray-800"
              : "text-gray-600 hover:text-gray-800"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
} 