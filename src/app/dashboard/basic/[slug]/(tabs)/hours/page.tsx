import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { format, parseISO, parse } from 'date-fns';
import { Clock, MoreVertical, Users, Receipt, ArrowUpRight } from 'lucide-react';

interface HourlyRow {
    sale_hour: number;
    hourly_net: number;
    hourly_gross: number;
    transaction_count: number;
}

interface SalesAggregates {
    cust_count: number;
    transact_count: number;
    open_time: string | null;
    close_time: string | null;
}

export default async function HourlySalesPage({
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

    // 2. Fetch Global Summary Aggregates (From our previous RPC fix)
    const { data: aggregateData } = await supabase
        .rpc('get_sales_aggregates', { res_id: restaurant.id, target_date: date })
        .single();

    const counts = aggregateData as SalesAggregates | null;

    // 3. Fetch Hourly Breakdown
    const { data: hourlyData } = await supabase
        .rpc('get_hourly_sales', { res_id: restaurant.id, target_date: date });

    const hourlySales = (hourlyData as HourlyRow[] | null) || [];

    // Formatter helpers
    const formatTime = (isoString: string | null) => {
        if (!isoString) return '--:--';
        return format(new Date(isoString), 'hh:mm a');
    };

    const formatHourLabel = (hour: number) => {
        const parsed = parse(`${hour}`, 'H', new Date());
        return format(parsed, 'hh:mm a');
    };

    // Calculate dynamic stats
    const totalGross = hourlySales.reduce((sum, h) => sum + Number(h.hourly_gross), 0);

    return (
        //<div className="flex flex-col min-h-screen bg-[#F0F2F5]">
        <div className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300">
            {/* Dark Navy Header */}
            <header className="bg-[#003366] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Clock size={22} />
                    <span className="font-bold text-lg">Hourly Sales</span>
                </div>
                <MoreVertical size={22} />
            </header>

            {/* Date Context Ribbon */}
            <div className="bg-white py-3 border-b border-gray-200 text-center">
                <h2 className="text-[#003366] font-bold text-[17px]">
                    {format(parseISO(date), 'EEEE, dd MMMM yyyy')}
                </h2>
            </div>

            <main className="p-4 space-y-4">
                {/* Metrics Dashboard Row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-md p-3 border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <Users size={18} className="text-gray-400 mb-1" />
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Customers</span>
                        <span className="text-base font-bold text-gray-800 mt-0.5">{counts?.cust_count || 0}</span>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <Receipt size={18} className="text-gray-400 mb-1" />
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Trxs</span>
                        <span className="text-base font-bold text-gray-800 mt-0.5">{counts?.transact_count || 0}</span>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <ArrowUpRight size={18} className="text-gray-400 mb-1" />
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Avg/Trx</span>
                        <span className="text-base font-bold text-gray-800 mt-0.5">
                            {counts?.transact_count
                                ? (totalGross / counts.transact_count).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                : '0.00'}
                        </span>
                    </div>
                </div>

                {/* Hourly Sales List Group */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {hourlySales.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No sales entries logged for this day.</div>
                    ) : (
                        hourlySales.map((hourRow) => (
                            <div key={hourRow.sale_hour} className="flex justify-between items-center px-4 py-2.5">
                                <div className="flex flex-col">
                                    <span className="text-[15px] text-gray-800 font-semibold">
                                        {formatHourLabel(hourRow.sale_hour)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {hourRow.transaction_count} {hourRow.transaction_count === 1 ? 'transaction' : 'transactions'}
                                    </span>
                                </div>
                                <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[75px] text-center tabular-nums">
                                    {Number(hourRow.hourly_gross).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Running Grand Total Row */}
                    {hourlySales.length > 0 && (
                        <div className="flex justify-between items-center px-4 py-4 bg-gray-50/70">
                            <span className="text-[15px] text-gray-900 font-bold">Total Sales</span>
                            <div className="bg-[#003366] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[75px] text-center">
                                {totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}