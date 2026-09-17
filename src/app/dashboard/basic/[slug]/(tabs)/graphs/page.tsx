import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
//import Link from 'next/link';
import Graph from '@/components/Graph';
import { PieChart } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import Header from '@/components/Header';

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

    if (!date) {
        return (
            <div className="p-10 text-center text-red-600 font-bold">
                Error: A specific date is required to view graphs, {date}
            </div>
        ); 
    }

    const dateObject = parseISO(date);
    if (!isValid(dateObject)) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-xl font-bold text-gray-800">Invalid Date Format</h1>
                <p className="text-gray-500">The date &quot;{date}&quot; is not a valid time value.</p>
            </div>
        );
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { count } = await supabase
        .from('restaurant_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

    const multipleRestaurants = (count || 0) > 1;

    // Fetch Restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, name')
        .ilike('slug', slug)
        .single();

    if (!restaurant) notFound();

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
        
    }[] | null;

    const totalGross = salesSummaryCast
        ? salesSummaryCast.reduce((sum, row) => sum + (row.summary_total || 0), 0)
        : 0;

    const sumGroupMap = salesSummaryCast
        ? salesSummaryCast.reduce((acc, row) => {
            const name = row.summary_name || 'Other';
            acc[name] = (acc[name] || 0) + (row.summary_total || 0);
            return acc;
        }, {} as Record<string, number>)
        : {};

    // 3. Clean up the data (Ensure no negative totals due to voids)
    const chartData = Object.entries(sumGroupMap).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100
    })).sort((a, b) => b.value - a.value);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
            <div className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300">
            {/* Header*/}
            <Header title="Sales by Summary Group" icon={<PieChart size={20} />} showChangeStore={multipleRestaurants} />

            {/* Date Title Section */}
            <div className="py-4 border-b border-gray-200 text-center">
                <h2 className="text-[#003366] font-bold text-lg">
                    {format(new Date(date), 'EEEE, d MMMM yyyy')}
                </h2>
            </div>

            {/* Pie Chart Placeholder */}
            <Graph chartData={chartData} />
            <div className="flex justify-between items-center px-4 py-4 bg-gray-50/70">
                <span className="text-sm text-gray-900 font-bold">Total Sales</span>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-bold min-w-[85px] text-right">
                    {totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </div>
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