import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { startOfDay, endOfDay } from 'date-fns';
import Link from 'next/link';
import { Store, ArrowRight, TrendingUp } from 'lucide-react';


interface SalesSummary {
    gross: number;
}

interface RestaurantWithSales {
    id: string;
    name: string;
    slug: string;
    sales: SalesSummary[];
}

interface RestaurantSalesMetric {
    id: string;
    name: string;
    slug: string;
    todayTotal: number;
}

export default async function SalesPortalPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();

    // Fetch with explicit typing for the Supabase result
    const { data, error } = await supabase
        .from('restaurants')
        .select(`
      id,
      name,
      slug,
      sales_items (
        gross
      )
    `)
        .filter('sales_items.created_at', 'gte', todayStart)
        .filter('sales_items.created_at', 'lte', todayEnd);

    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    // Cast the raw data to our interface
    const rawRestaurants = (data as unknown) as RestaurantWithSales[];

    // Process data with strict typing
    const restaurantSales: RestaurantSalesMetric[] = rawRestaurants.map((res) => {
        const total = res.sales.reduce((sum, sale) => sum + sale.gross, 0);
        return {
            id: res.id,
            name: res.name,
            slug: res.slug,
            todayTotal: total
        };
    });

    const grandTotal = restaurantSales.reduce((sum, res) => sum + res.todayTotal, 0);

    return (
        <main className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-gray-50">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Executive Summary</h1>
                    <p className="text-gray-500 mt-1">Daily aggregate performance across your portfolio</p>
                </div>
                <div className="hidden md:block text-right">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                        Live Updates
                    </span>
                </div>
            </header>

            <div className="grid gap-4">
                {restaurantSales.length > 0 ? (
                    restaurantSales.map((res: RestaurantSalesMetric) => (
                        <Link
                            key={res.id}
                            href={`/dashboard/${res.slug}`}
                            className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                    <Store className="text-gray-400 group-hover:text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{res.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs text-gray-400 font-medium">Active today</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Todays Gross</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${res.todayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">No sales recorded yet for today.</p>
                    </div>
                )}
            </div>

            {/* Grand Total Section */}
            <section className="relative overflow-hidden mt-12 p-10 bg-blue-600 rounded-3xl text-white shadow-2xl shadow-blue-200">
                <TrendingUp className="absolute -right-4 -bottom-4 text-blue-500 opacity-20" size={160} />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-blue-100 font-semibold uppercase tracking-widest text-sm">Total Portfolio Revenue</h2>
                        <p className="text-blue-200 text-xs mt-1">Combined totals from {restaurantSales.length} locations</p>
                    </div>
                    <div className="text-right">
                        <p className="text-5xl font-black tracking-tighter">
                            ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}