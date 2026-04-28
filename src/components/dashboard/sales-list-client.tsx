"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Home, Search, X } from 'lucide-react';

interface RestaurantSales {
  id: string;
  name: string;
  slug: string;
  todayTotal: number;
}

interface SalesListProps {
    initialData: RestaurantSales[];
    dayName: string;
}

export function SalesListClient({ initialData, dayName }: SalesListProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredData = initialData.filter((res) => 
    res.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grandTotal = filteredData.reduce((sum, res) => sum + res.todayTotal, 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#E5E5E5]">
      {/* Header with Search Integration */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-10">
        <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-100">
          <Home size={16} className="text-gray-700" />
          <h1 className="text-sm font-semibold text-gray-800">Select Store</h1>
        </div>
        
        {/* Search Bar */}
        <div className="p-2 bg-[#F9F9F9]">
          <div className="relative max-w-4xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search by store name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* List Area */}
      <main className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300">
        {filteredData.length > 0 ? (
          filteredData.map((res) => (
            <Link 
              key={res.id} 
              href={`/dashboard/${res.slug}`}
              className="flex justify-between items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
            >
              <div className="space-y-1">
                <h2 className="text-[15px] font-normal text-gray-900 group-hover:text-blue-600 transition-colors">
                  {res.name}
                </h2>
                <p className="text-[13px] text-gray-500">{dayName}</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] text-gray-900 font-medium">
                  {res.todayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-12 text-center text-gray-500 text-sm">
            No stores found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </main>

      {/* Sticky Footer */}
      <footer className="bg-[#F3F3F3] border-t border-gray-300 p-4 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-end items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">Total:</span>
          <span className="text-lg font-bold text-gray-900">
            {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </footer>
    </div>
  );
}