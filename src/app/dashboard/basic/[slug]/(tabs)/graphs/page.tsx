import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MoreVertical, BarChart2, Clock, Star, List } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';

export default async function GraphPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    //searchParams: Promise<{ start: string; end: string }>
        searchParams: Promise<{dateString: string}>
}) {
    const { slug } = await params;
    //const { start, end } = await searchParams;
    const { dateString } = await searchParams;
    const supabase = await createClient();

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
    const { data: rawItems } = await supabase
        .from('sales_items')
        .select('summary_group, gross, qty, item_type')
        .eq('open_date', dateString)
        .in('item_type', ['Sale_Item', 'Voided_Item']); // Fetch both at once

    // 2. Aggregate data by summary_group for the list and chart
    /*const summaryGroupTotals = sales?.reduce((acc, item) => {
        const group = item.summary_group || 'Uncategorized';
        acc[group] = (acc[group] || 0) + (item.gross || 0);
        return acc;
    }, {} as Record<string, number>) || {};
    */
    // 2. Aggregate and Subtract
    const sumGroupMap = rawItems?.reduce((acc, item) => {
        const summaryG = item.summary_group || 'Other';

        if (!acc[summaryG]) acc[summaryG] = 0;

        if (item.item_type === 'Sale_Item') {
            acc[summaryG] += (item.gross || 0) * (item.qty || 0);
        } else if (item.item_type === 'Voided_Item') {
            acc[summaryG] += item.gross; // Subtract the void
        }

        return acc;
    }, {} as Record<string, number>) || {};

    // 3. Clean up the data (Ensure no negative totals due to voids)
    const chartData = Object.entries(sumGroupMap)
        .map(([name, value]) => ({
            name,
            value: Math.max(0, Math.round(value * 100) / 100) // Voids shouldn't make a category negative
        }))
        .filter(item => item.value > 0) // Hide categories with 0 net sales
        .sort((a, b) => b.value - a.value);

    // Define your color palette (Matches the vibrant look in image_1d3998.png)
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
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={60} // Makes it a donut like the image
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: unknown) => `€${(value as number).toFixed(2)}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <span className="font-bold text-lg">Graphs</span>
                    </div>
                </div>
                <MoreVertical size={22} />
            </header>

            {/* 2. Date Title Section */}
            <div className="py-4 border-b border-gray-200 text-center">
                <h2 className="text-[#003366] font-bold text-lg">
                    {format(new Date(dateString), 'EEEE, d MMMM yyyy')}
                </h2>
            </div>

            {/* 3. Pie Chart Placeholder */}
            {/* You can integrate a library like Recharts or Nivo here */}
            <div className="flex justify-center py-8 bg-gray-50/50">
                <div className="w-48 h-48 rounded-full border-[16px] border-blue-400 border-l-green-500 border-b-green-500 relative flex items-center justify-center">
                    {/* This represents the visual from image_1d3998.png */}
                </div>
            </div>

            {/* 4. Summary Group List */}
            <div className="w-full px-4 space-y-2">
                {chartData.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            {/* The color indicator matching the graph slice */}
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            >
                                <span className="rotate-180">▶</span>
                            </div>
                            <span className="text-[15px] font-medium text-gray-700">{item.name}</span>
                        </div>

                        {/* Blue Badge for price, matching image_1d3998.png */}
                        <div className="bg-[#3b82f6] text-white px-3 py-1 rounded text-sm font-bold min-w-[85px] text-right">
                            {item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
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