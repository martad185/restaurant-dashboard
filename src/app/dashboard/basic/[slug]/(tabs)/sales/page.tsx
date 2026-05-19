import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { format, parseISO, parse } from 'date-fns';
import { BarChart2 } from 'lucide-react';
import Header from '@/components/Header';


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
        notFound();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { count } = await supabase
        .from('restaurant_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

    const multipleRestaurants = (count || 0) > 1;

    // 1. Fetch Restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .ilike('slug', slug)
        .single();

    if (!restaurant) notFound();

    // 2. Fetch Sales Data (Grouping by sales_type)
    const { data: rawItems } = await supabase
        .from('sales')
        .select('sales_type, grosstotal')
        .eq('restaurant_id', restaurant.id)
        .eq('open_date', date)
        .order('sales_type', { ascending: true });

    let runningGrandGross = 0;

    // 3. Aggregate Logic
    const salesBySource = rawItems?.reduce((acc, item) => {
        const source = item.sales_type || 'Other';
        const amount = item.grosstotal || 0;

        if (!acc[source]) acc[source] = 0;

        acc[source] += amount;
        runningGrandGross += item.grosstotal

        return acc;
    }, {} as Record<string, number>) || {};

    
    const sortedSales = Object.entries(salesBySource).sort((a, b) => b[1] - a[1]);
    //const totalTax = Math.max(0, runningGrandGross - runningGrandNet);
    
    //4. Fetch Refunds Data (Placeholder for now)
    const { data: refunds } = await supabase
        .from('sales_items')
        .select('gross')
        .eq('restaurant_id', restaurant.id)
        .eq('open_date', date)
        .eq('item_type', 'Voided_Item');

    //5. Aggregate Refunds
    const totalRefunds = refunds?.reduce((acc, item) => acc + (item.gross || 0), 0) || 0;

    //6. Fetch number of transactions & customers (Placeholder for now)
    const { data: counts, error } = await supabase 
        .rpc('get_sales_aggregates', {
            res_id: restaurant.id,
            target_date: date
        })
        .single();

    if (error) {
        //notFound();
        return <div>RPC Error Details:{error.message}, {error.details}, {error.hint}</div>;
            //console.error("RPC Error Details:", error.message, error.details, error.hint);
    }
    // Use .single() since it returns exactly one row of summary data
    // Cast the data directly
    const countsCast = counts as {
        cust_count: number;
        transact_count: number;
        open_time: string | null;
        close_time: string | null;
    } | null;

    // Access your fields cleanly
    const custCount = countsCast?.cust_count || 0;
    const transactCount = countsCast?.transact_count || 0;
    const avgSalePerTransact = transactCount > 0 ? runningGrandGross / transactCount : 0;
    const openTime = countsCast?.open_time || null;
    const closeTime = countsCast?.close_time || null;

    // 1. Fallback default if openTime is null or undefined
    let formattedOpenTime = '--:--';
    let formattedCloseTime = '--:--';

    if (openTime) {
        // If your database returns a full ISO timestamp string (e.g., "2026-05-17T08:30:00Z")
        if (openTime.includes('T')) {
            formattedOpenTime = format(new Date(openTime), 'hh:mm a');
        }
        // If your database returns a plain time string (e.g., "08:30:00" or "14:45:00")
        else {
            const parsedTime = parse(openTime.substring(0, 5), 'HH:mm', new Date());
            formattedOpenTime = format(parsedTime, 'hh:mm a');
        }
    }

    if (closeTime) {
        // If your database returns a full ISO timestamp string (e.g., "2026-05-17T08:30:00Z")
        if (closeTime.includes('T')) {
            formattedCloseTime = format(new Date(closeTime), 'hh:mm a');
        }
        // If your database returns a plain time string (e.g., "08:30:00" or "14:45:00")
        else {
            const parsedTime = parse(closeTime.substring(0, 5), 'HH:mm', new Date());
            formattedOpenTime = format(parsedTime, 'hh:mm a');
        }
    }

    return (
        <div className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300">
            {/*<div className="flex flex-col min-h-screen bg-[#F0F2F5]">*/}
            {/* Dark Navy Header */}
            <Header title="Sales by Sales Type" icon={<BarChart2 size={22} />} showChangeStore={multipleRestaurants} />
            {/*<header className="bg-[#003366] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <BarChart2 size={22} />
                    <span className="font-bold text-lg">Sales</span>
                </div>
                <MoreVertical size={22} />
            </header>
            */}
            {/* Date Display */}
            <div className="bg-white py-3 border-b border-gray-200 text-center">
                
                <h2 className="text-[#003366] font-bold text-[17px]">
                    {format(parseISO(date), 'EEEE, dd MMMM yyyy')}
                </h2>
            </div>

            <main className="p-4 space-y-4">
                {/* Total Sales Card */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                    <span className="text-gray-500 text-sm font-bold">Total Sales</span>
                    <div className="text-[#003366] text-3xl font-bold mt-1">
                        {runningGrandGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Sales Breakdown List */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {sortedSales.map(([source, total]) => (
                        <div key={source} className="flex justify-between items-center px-4 py-2">
                            <span className="text-[15px] text-gray-700 font-medium">{source}</span>
                            <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[70px] text-center">
                                {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    ))}

                    {/* Totals with Tax Row */}
                    <div className="flex justify-between items-center px-4 py-4 bg-gray-50/50">
                        <span className="text-[15px] text-gray-900 font-bold">Totals</span>
                        <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[70px] text-center">
                            {runningGrandGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Refunds Section */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                    <h3 className="text-gray-800 font-bold text-md">Refunds</h3>
                    <div className="h-px bg-gray-300 w-full mt-1"></div>
                    <div className="text-[#003366] text-2xl font-bold mt-1">
                        {totalRefunds.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
                {/* Counts Section */ }
                <div className="bg-white rounded-md shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center px-4 py-2">
                        <span className="text-[15px] text-gray-700 font-medium">Customer Count</span>
                        <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[70px] text-center">
                            {custCount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </div>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2">
                        <span className="text-[15px] text-gray-700 font-medium">Transaction Count</span>
                        <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[70px] text-center">
                            {transactCount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </div>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2">
                        <span className="text-[15px] text-gray-700 font-medium">Avg Sale per Transaction</span>
                        <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[70px] text-center">
                            {avgSalePerTransact.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-md shadow-sm border border-gray-200">
                    <div className="bg-white py-3 border-b border-gray-200 text-center">

                        <h2 className="text-[#003366] font-bold text-[17px]">
                            Open Time: {formattedOpenTime}
                        </h2>
                        <h2 className="text-[#003366] font-bold text-[17px]">
                            Close Time: {formattedCloseTime}
                        </h2>
                    </div>
                </div>
            </main>
        </div>
    );
}