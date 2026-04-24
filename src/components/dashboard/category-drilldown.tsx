"use client";

import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface Sales_Items {
  gross: number;
  category: string;
  descript: string;
}

interface DataPoint {
    name: string;
    value: number;
}

export function CategoryDrilldown({ data }: { data: Sales_Items[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 1. Calculate Category-level data
  const categoryData = useMemo(() => {
      const groups = data.reduce<Record<string, DataPoint>>((acc, sales) => {
      const cat = sales.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = { name: cat, value: 0 };
      acc[cat].value += sales.gross;
      return acc;
    }, {});
    return Object.values(groups).sort((a, b) => b.value - a.value);
  }, [data]);

  // 2. Calculate Product-level data for the selected category
  const productData = useMemo(() => {
    if (!selectedCategory) return [];
    const filtered = data.filter(d => d.category === selectedCategory);
    const groups = filtered.reduce<Record<string, DataPoint>>((acc, sales) => {
      const name = sales.descript || 'Unknown Item';
      if (!acc[name]) acc[name] = { name, value: 0 };
      acc[name].value += sales.gross;
      return acc;
    }, {});
    return Object.values(groups).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10 items
  }, [data, selectedCategory]);

  const activeData = selectedCategory ? productData : categoryData;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">
          {selectedCategory ? `Top Products in ${selectedCategory}` : 'Sales by Category'}
        </h3>
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            ← Back to Categories
          </button>
        )}
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={activeData} 
            layout="vertical" 
            margin={{ left: 40, right: 40 }}
            onClick={(state) => {
              if (!selectedCategory && state?.activeLabel) {
                setSelectedCategory(state.activeLabel as string);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={120}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip 
              cursor={{ fill: '#f3f4f6' }}
              formatter={(val: unknown) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]} 
              className={selectedCategory ? "cursor-default" : "cursor-pointer"}
            >
              {activeData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={selectedCategory ? '#10b981' : '#3b82f6'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {!selectedCategory && (
        <p className="text-center text-xs text-gray-400 italic">
          Tip: Click a bar to view product details
        </p>
      )}
    </div>
  );
}