import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Graph from '@/components/Graph';
import { ArrowLeft, MoreVertical, PieChart } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

export default async function GraphPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{date: string}>
}) {
    const { slug } = await params;
    const { date } = await searchParams;
    const supabase = await createClient();

    // 1. Strict Validation: If no date is provided, trigger 404 or Error
    if (!date) {
        return (
            <div className="p-10 text-center text-red-600 font-bold">
                Error: A specific date is required to view graphs, {date}
            </div>
        ); 
    }

    // 2. Format Validation: Ensure the string is a valid date
    const dateObject = parseISO(date);
    if (!isValid(dateObject)) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-xl font-bold text-gray-800">Invalid Date Format</h1>
                <p className="text-gray-500">The date &quot;{date}&quot; is not a valid time value.</p>
            </div>
        );
    }

    // 1. Fetch Restaurant & Sales Data
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, name')
        .ilike('slug', slug)
        .single();

    if (!restaurant) notFound();

    /*const { data: sales } = await supabase
        .from('sales_items')
        .select('summary_group, gross, qty')
        .eq('restaurant_id', restaurant.id)
        .eq('open_date', date)
        .eq('item_type','Sale_Item');
        //.gte('time_ord', start)
    //.lte('time_ord', end);
    */

    // Inside your Graphs Page component
    /*const { data: rawItems } = await supabase
        .from('sales_items')
        .select('summary_group, gross, qty, item_type')
        .eq('open_date', date)
        .in('item_type', ['Sale_Item', 'Voided_Item']); */// Fetch both at once

    //Fetch sales by summary group using RPC
    const { data: salesBySummary, error } = await supabase
        .rpc('get_sales_summary', {
            res_id: restaurant.id,
            target_date: date
        })

    if (error) {
        //notFound();
        return <div>RPC Error Details:{error.message}, {error.details}, {error.hint}</div>;
        //console.error("RPC Error Details:", error.message, error.details, error.hint);
    }
    // Use .single() since it returns exactly one row of summary data
    // Cast the data directly
    const salesSummaryCast = salesBySummary as {
        summary_name: string | null;
        summary_total: number;
        
    } | null;

    // 2. Aggregate data by summary_group for the list and chart
    /*const summaryGroupTotals = sales?.reduce((acc, item) => {
        const group = item.summary_group || 'Uncategorized';
        acc[group] = (acc[group] || 0) + (item.gross || 0);
        return acc;
    }, {} as Record<string, number>) || {};
    */
    // 2. Aggregate and Subtract
    /*const sumGroupMap = rawItems?.reduce((acc, item) => {
        const summaryG = item.summary_group || 'Other';

        if (!acc[summaryG]) acc[summaryG] = 0;

        if (item.item_type === 'Sale_Item') {
            acc[summaryG] += (item.gross || 0) * (item.qty || 0);
        } else if (item.item_type === 'Voided_Item') {
            acc[summaryG] += item.gross; // Subtract the void
        }

        return acc;
    }, {} as Record<string, number>) || {};
    */
    const sumGroupMap = salesSummaryCast ? { [salesSummaryCast.summary_name || 'Other']: salesSummaryCast.summary_total } : {};
    // 3. Clean up the data (Ensure no negative totals due to voids)
    const chartData = Object.entries(sumGroupMap).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100
    })).sort((a, b) => b.value - a.value);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        //<div className="flex flex-col min-h-screen bg-white pb-20">
            <div className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300">
            {/* 1. Header - Matching deep navy brand color */}
            <header className="bg-[#003366] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href={`/dashboard/basic/${slug}`}>
                        <ArrowLeft size={22} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <PieChart size={20} />
                        <span className="font-bold text-lg">Graphs</span>
                    </div>
                </div>
                <MoreVertical size={22} />
            </header>

            {/* 2. Date Title Section */}
            <div className="py-4 border-b border-gray-200 text-center">
                <h2 className="text-[#003366] font-bold text-lg">
                    {format(new Date(date), 'EEEE, d MMMM yyyy')}
                </h2>
            </div>

            {/* 3. Pie Chart Placeholder */}
            {/* You can integrate a library like Recharts or Nivo here */}
            <Graph chartData={chartData} />

            {/* 4. Summary Group List */}
            {/* <div className="w-full px-4 space-y-2">
                {chartData.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            >
                                <span className="rotate-180">▶</span>
                            </div>
                            <span className="text-[15px] font-medium text-gray-700">{item.name}</span>
                        </div>

                        <div className="bg-[#3b82f6] text-white px-3 py-1 rounded text-sm font-bold min-w-[85px] text-right">
                            {item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
            </div >
            */}
        </div>
    );
}

// Helper Component for Bottom Nav
function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`flex flex-col items-center gap-1 cursor-pointer ${active ? 'text-blue-600' : 'text-gray-500'}`}>
            {icon}
            <span className="text-[10px] font-medium text-center">{label}</span>
        </div>
    );
}