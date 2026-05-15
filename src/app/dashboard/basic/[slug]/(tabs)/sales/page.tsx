import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { MoreVertical, BarChart2 } from 'lucide-react';

export default async function SalesPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ date: string }>
}) {
    const { slug } = await params;
    const { date } = await searchParams;

    if (!date)
        return (
            <div className="p-10 text-center text-red-600 font-bold">
                Error: A specific date is required to view sales by sales type, {date}
            </div>
        ); 
//        notFound();

    const supabase = await createClient();

    // 1. Fetch Restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .ilike('slug', slug)
        .single();

    if (!restaurant) notFound();

    // 2. Fetch Sales Data (Grouping by order_type or source)
    // Adjust 'order_type' to match your column name (e.g., 'source' or 'terminal')
    const { data: rawItems } = await supabase
        .from('sales')
        .select('sales_type, nettotal')
        .eq('restaurant_id', restaurant.id)
        .eq('open_date', date);

    // 3. Aggregate Logic
    const salesBySource = rawItems?.reduce((acc, item) => {
        const source = item.sales_type || 'Other';
        const amount = item.nettotal || 0;

        if (!acc[source]) acc[source] = 0;

        acc[source] += amount;

        return acc;
    }, {} as Record<string, number>) || {};

    const sortedSales = Object.entries(salesBySource).sort((a, b) => b[1] - a[1]);
    const grandTotal = sortedSales.reduce((sum, [, val]) => sum + val, 0);

    return (
        <div className="flex flex-col min-h-screen bg-[#F0F2F5]">
            {/* Dark Navy Header */}
            <header className="bg-[#003366] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <BarChart2 size={22} />
                    <span className="font-bold text-lg">Sales</span>
                </div>
                <MoreVertical size={22} />
            </header>

            {/* Date Display */}
            {/*<div className="bg-white py-3 border-b border-gray-200 text-center">*/}
                <div className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300">
                <h2 className="text-[#003366] font-bold text-[17px]">
                    {format(parseISO(date), 'EEEE, dd MMMM yyyy')}
                </h2>
            </div>

            <main className="p-4 space-y-4">
                {/* Total Sales Card */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                    <span className="text-gray-500 text-sm font-bold">Total Sales</span>
                    <div className="text-[#003366] text-3xl font-bold mt-1">
                        {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Sales Breakdown List */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {sortedSales.map(([source, total]) => (
                        <div key={source} className="flex justify-between items-center px-4 py-4">
                            <span className="text-[15px] text-gray-700 font-medium">{source}</span>
                            <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[70px] text-center">
                                {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    ))}

                    {/* Totals with Tax Row */}
                    <div className="flex justify-between items-center px-4 py-4 bg-gray-50/50">
                        <span className="text-[15px] text-gray-900 font-bold">Totals with Tax</span>
                        <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[70px] text-center">
                            {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Refunds Placeholder Section */}
                <div className="pt-2">
                    <h3 className="text-gray-800 font-bold text-lg">Refunds</h3>
                    <div className="h-px bg-gray-300 w-full mt-1"></div>
                </div>
            </main>
        </div>
    );
}