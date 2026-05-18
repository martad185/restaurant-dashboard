import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Star, MoreVertical, Trophy } from 'lucide-react';

interface TopItemRow {
    item_name: string;
    qty_sold: number;
    gross_total: number;
}

export default async function Top20SalesPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ date: string }>
}) {
    const { slug } = await params;
    const { date } = await searchParams;

    if (!date) notFound();
    const supabase = await createClient();

    // 1. Fetch Restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .ilike('slug', slug)
        .single();

    if (!restaurant) notFound();

    // 2. Fetch Top 20 Items RPC data
    const { data: top20Data, error } = await supabase
        .rpc('get_top_20_sales', { res_id: restaurant.id, target_date: date });

    const itemsList = (top20Data as TopItemRow[] | null) || [];

    return (
        //<div className="flex flex-col min-h-screen bg-[#F0F2F5]">
        <div className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300">
            {/* Dark Navy Header */}
            <header className="bg-[#003366] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Star size={22} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">Top 20 Sales</span>
                </div>
                <MoreVertical size={22} />
            </header>

            {/* Date Display Context Banner */}
            <div className="bg-white py-3 border-b border-gray-200 text-center">
                <h2 className="text-[#003366] font-bold text-[17px]">
                    {format(parseISO(date), 'EEEE, dd MMMM yyyy')}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Best performing items ranked by total sales per item for the selected date.
                </p>
            </div>

            <main className="p-4">
                {/* Product Performance List */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {itemsList.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No product records found for this date view.
                        </div>
                    ) : (
                        itemsList.map((item, index) => {
                            const rank = index + 1;
                            // Style the top 3 items beautifully with colors matching your status
                            const isTop3 = rank <= 3;

                            return (
                                <div key={item.item_name} className="flex justify-between items-center px-4 py-3.5 group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Rank Position Identifier */}
                                        <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold shrink-0 ${rank === 1 ? 'bg-amber-100 text-amber-700' :
                                                rank === 2 ? 'bg-slate-100 text-slate-700' :
                                                    rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                        'text-gray-400 bg-gray-50'
                                            }`}>
                                            {rank === 1 ? <Trophy size={13} className="text-amber-500" /> : rank}
                                        </div>

                                        {/* Item Identification Metadata */}
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[14px] text-gray-800 font-medium truncate">
                                                {item.item_name}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                Qty: <strong className="text-gray-600 font-semibold">{Number(item.qty_sold)}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Gross Sales Value Metric Badge */}
                                    <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[75px] text-center tabular-nums shadow-sm shrink-0">
                                        {Number(item.gross_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}