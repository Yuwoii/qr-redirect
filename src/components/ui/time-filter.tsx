'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type TimeSpan = 'day' | 'week' | 'month' | 'year' | 'all';

interface TimeFilterProps {
  value: TimeSpan;
  onChange: (value: TimeSpan) => void;
  className?: string;
}

export function TimeFilter({ value, onChange, className }: TimeFilterProps) {
  const options: Array<{ value: TimeSpan; label: string }> = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className={cn("flex space-x-1 rounded-full bg-gray-100 p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-full transition-colors",
            value === option.value
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
} 