import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function SelectDayPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();

    // 1. Fetch the restaurant first. 
    // If this fails, the SLUG is wrong, so we 404.
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('slug', params.slug)
        .maybeSingle();

    if (!restaurant) notFound();

    // 2. Generate the last 8 days (UI Shell)
    // We do this BEFORE fetching sales so we always have the dates ready.
    const days = Array.from({ length: 8 }).map((_, i) => {
        const date = subDays(new Date(), i);
        return {
            label: format(date, 'EEEE'),
            start: startOfDay(date).toISOString(),
            end: endOfDay(date).toISOString()
        };
    });

    // 3. Fetch sales. Use maybeSingle or wrap in try/catch to ensure it doesn't crash.
    const dailyData = await Promise.all(
        days.map(async (day) => {
            const { data, error } = await supabase
                .from('sales_items')
                .select('gross')
                .eq('restaurant_id', restaurant.id)
                .gte('time_ord', day.start)
                .lte('time_ord', day.end);

            // If error or no data, we return 0 instead of failing
            const total = data?.reduce((sum, item) => sum + (item.gross || 0), 0) || 0;

            return {
                dateLabel: day.label,
                total
            };
        })
    );

    const grandTotal = dailyData.reduce((sum, day) => sum + day.total, 0);

    return (
        <div className="flex flex-col min-h-screen bg-[#E5E5E5]">
            {/* Header - Matching image_a51306.png */}
            <header className="bg-white border-b border-gray-300 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
                <Link href="/portals/sales" className="text-gray-600 hover:text-black">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-700" />
                    <h1 className="text-[15px] font-semibold text-gray-800">Select Day</h1>
                </div>
            </header>

            {/* Main List Area */}
            <main className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300">
                {dailyData.map((day, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                        <span className="text-[15px] text-gray-900 font-normal">
                            {day.dateLabel}
                        </span>
                        <span className="text-[15px] text-gray-900 font-medium tabular-nums">
                            {day.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                ))}
            </main>

            {/* Footer Total */}
            <footer className="bg-[#F3F3F3] border-t border-gray-300 p-4 sticky bottom-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-end items-baseline gap-2 pr-2">
                    <span className="text-[15px] font-bold text-gray-900">Total:</span>
                    <span className="text-[15px] font-bold text-gray-900">
                        {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </footer>
        </div>
    );
}