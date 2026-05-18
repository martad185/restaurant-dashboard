import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { List, MoreVertical } from 'lucide-react';

interface CategoryRow {
    category_name: string;
    category_net: number;
    category_gross: number;
}

export default async function CategorySalesPage({
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

    // 2. Fetch Category RPC summary data
    const { data: categoryData } = await supabase
        .rpc('get_category_sales', { res_id: restaurant.id, target_date: date });

    const categoriesList = (categoryData as CategoryRow[] | null) || [];

    // Calculate total layout context metrics
    const grandCategoryTotal = categoriesList.reduce((sum, c) => sum + Number(c.category_gross), 0);

    return (
        // <div className="flex flex-col min-h-screen bg-[#F0F2F5]">
        <div className="flex-1 bg-white max-w-4xl mx-auto w-full border-x border-gray-300">
            {/* Dark Navy Header */}
            <header className="bg-[#003366] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <List size={22} />
                    <span className="font-bold text-lg">Category Sales</span>
                </div>
                <MoreVertical size={22} />
            </header>

            {/* Date Context Ribbon */}
            <div className="bg-white py-3 border-b border-gray-200 text-center">
                <h2 className="text-[#003366] font-bold text-[17px]">
                    {format(parseISO(date), 'EEEE, dd MMMM yyyy')}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Revenue breakdown organized by menu departments
                </p>
            </div>

            <main className="p-4 space-y-4">
                {/* Category List Layout Group */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {categoriesList.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No sales grouped by categories for this day.
                        </div>
                    ) : (
                        categoriesList.map((cat) => {
                            // Calculate percentage contribution to overall business dynamically
                            const percentage = grandCategoryTotal > 0
                                ? (Number(cat.category_gross) / grandCategoryTotal) * 100
                                : 0;

                            return (
                                <div key={cat.category_name} className="flex justify-between items-center px-4 py-4">
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[15px] text-gray-800 font-semibold truncate">
                                            {cat.category_name}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium mt-0.5">
                                            {percentage.toFixed(1)}% of total sales
                                        </span>
                                    </div>
                                    <div className="bg-[#4A90E2] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[75px] text-center tabular-nums">
                                        {Number(cat.category_gross).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Running Grand Summary Total Footer */}
                    {categoriesList.length > 0 && (
                        <div className="flex justify-between items-center px-4 py-4 bg-gray-50/70">
                            <span className="text-[15px] text-gray-900 font-bold">Totals with Tax</span>
                            <div className="bg-[#003366] text-white px-2 py-0.5 rounded text-[13px] font-bold min-w-[75px] text-center">
                                {grandCategoryTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}