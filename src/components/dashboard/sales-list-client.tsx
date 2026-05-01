"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Home, Search, X, Store } from 'lucide-react';

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

    const filteredData = useMemo(() => {
        return initialData.filter((res) =>
            res.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [initialData, searchQuery]);

    const grandTotal = useMemo(() => {
        return filteredData.reduce((sum, res) => sum + res.todayTotal, 0);
    }, [filteredData]);
   

    return (
        <div className="flex flex-col min-h-screen bg-[#E5E5E5]">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-300 sticky top-0 z-20">
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Home size={16} className="text-gray-700" />
                        <h1 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Select Store</h1>
                    </div>
                    <div className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {initialData.length} LOCATIONS
                    </div>
                </div>

                {/* Search Bar Container */}
                <div className="p-3 bg-[#F9F9F9] shadow-sm">
                    <div className="relative max-w-4xl mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search store name..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 text-gray-900 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main List Area */}
            <main className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300 shadow-lg">
                {filteredData.length > 0 ? (
                    filteredData.map((res) => (
                        <Link
                            key={res.id}
                            href={`/dashboard/basic/${res.slug}`}
                            className="flex justify-between items-center px-5 py-4 border-b border-gray-100 hover:bg-blue-50/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <Store size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                <div className="space-y-0.5">
                                    <h2 className="text-[15px] font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                        {res.name}
                                    </h2>
                                    <p className="text-[12px] text-gray-400 font-medium uppercase tracking-wider">{dayName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[16px] text-gray-900 font-bold tabular-nums">
                                    {res.todayTotal.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-20 text-center space-y-2">
                        <p className="text-gray-500 font-medium">No stores found matching &quot;{searchQuery}&quot;</p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="text-blue-600 text-sm font-bold hover:underline"
                        >
                            Clear search results
                        </button>
                    </div>
                )}
            </main>

            {/* Persistent Grand Total Footer */}
            <footer className="bg-[#F3F3F3] border-t border-gray-300 p-5 sticky bottom-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Aggregate Total</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-gray-500 mb-1">€</span>
                        <span className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
                            {grandTotal.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}