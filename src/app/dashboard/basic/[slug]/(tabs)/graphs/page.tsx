import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MoreVertical, PieChart, BarChart2, Clock, Star, List } from 'lucide-react';
import { format } from 'date-fns';

export default async function GraphPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ start: string; end: string }>
}) {
    const { slug } = await params;
    const { start, end } = await searchParams;
    const supabase = await createClient();

    // 1. Fetch Restaurant & Sales Data
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, name')
        .ilike('slug', slug)
        .single();

    if (!restaurant) notFound();

    const { data: sales } = await supabase
        .from('sales_items')
        .select('summary_group, gross')
        .eq('restaurant_id', restaurant.id)
        .gte('time_ord', start)
        .lte('time_ord', end);

    // 2. Aggregate data by summary_group for the list and chart
    const summaryGroupTotals = sales?.reduce((acc, item) => {
        const group = item.summary_group || 'Uncategorized';
        acc[group] = (acc[group] || 0) + (item.gross || 0);
        return acc;
    }, {} as Record<string, number>) || {};

    const summaryGroups = Object.entries(summaryGroupTotals).sort((a, b) => b[1] - a[1]);
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
                    {format(new Date(start), 'EEEE, d MMMM yyyy')}
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
            <div className="flex-1 px-4">
                {summaryGroups.map(([name, total]) => (
                    <div key={name} className="flex justify-between items-center py-4 border-b border-gray-100 group">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500 rounded-full p-1 text-white">
                                <ArrowLeft className="rotate-180" size={14} />
                            </div>
                            <span className="text-[16px] font-medium text-gray-800">{name}</span>
                        </div>
                        <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold min-w-[80px] text-right">
                            {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
            </div>

            {/* 5. Bottom Navigation Bar - Matching image_1d3998.png */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#F8F9FA] border-t border-gray-300 flex justify-around py-2 shadow-lg">
                <NavItem icon={<PieChart size={20} />} label="Graphs" active />
                <NavItem icon={<BarChart2 size={20} />} label="Sales" />
                <NavItem icon={<Clock size={20} />} label="Hour Sales" />
                <NavItem icon={<Star size={20} />} label="Top 20 Sales" />
                <NavItem icon={<List size={20} />} label="Category Sales" />
            </nav>
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