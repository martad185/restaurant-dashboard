"use client";

import { useMemo } from 'react';
import { format, parseISO, getHours, getDay } from 'date-fns';

interface Sales_Items {
  time_ord: string;
  gross: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function SalesHeatmap({ data }: { data: Sales_Items[] }) {
  const heatmapData = useMemo(() => {
    // Initialize 7x24 grid with zeros
    const grid = Array(7).fill(0).map(() => Array(24).fill(0));
    let maxSales = 0;

    data.forEach(sales => {
      const date = parseISO(sales.time_ord);
      const day = getDay(date);
      const hour = getHours(date);
      
      grid[day][hour] += sales.gross;
      if (grid[day][hour] > maxSales) maxSales = grid[day][hour];
    });

    return { grid, maxSales };
  }, [data]);

  const getOpacity = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    const intensity = value / heatmapData.maxSales;
    if (intensity < 0.2) return 'bg-blue-100 text-blue-800';
    if (intensity < 0.4) return 'bg-blue-200 text-blue-800';
    if (intensity < 0.6) return 'bg-blue-400 text-white';
    if (intensity < 0.8) return 'bg-blue-600 text-white';
    return 'bg-blue-800 text-white';
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header: Hours */}
        <div className="grid grid-cols-[80px_repeat(24,1fr)] mb-2">
          <div />
          {HOURS.map(h => (
            <div key={h} className="text-[10px] font-medium text-gray-400 text-center">
              {h}:00
            </div>
          ))}
        </div>

        {/* Rows: Days */}
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 mb-1">
            <div className="text-sm font-semibold text-gray-600 flex items-center">
              {day}
            </div>
            {HOURS.map(hour => {
              const value = heatmapData.grid[dayIdx][hour];
              return (
                <div
                  key={`${dayIdx}-${hour}`}
                  title={`${day} at ${hour}:00 - $${value.toFixed(2)}`}
                  className={`h-8 rounded-sm flex items-center justify-center text-[8px] transition-all hover:ring-2 hover:ring-blue-300 cursor-default ${getOpacity(value)}`}
                >
                  {value > 0 && Math.round(value)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
        <span>Less Sales</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-blue-100 rounded-sm" />
          <div className="w-4 h-4 bg-blue-200 rounded-sm" />
          <div className="w-4 h-4 bg-blue-400 rounded-sm" />
          <div className="w-4 h-4 bg-blue-600 rounded-sm" />
          <div className="w-4 h-4 bg-blue-800 rounded-sm" />
        </div>
        <span>More Sales</span>
      </div>
    </div>
  );
}