import { createClient } from '@/lib/supabase/server';
import { SalesHeatmap } from '@/components/dashboard/sales-heatmap';
import { redirect } from 'next/navigation';

export default async function HeatmapPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // We only need the timestamp and amount for the heatmap
    const { data, error } = await supabase
        .from('sales_items')
        .select('time_ord, gross')
        .is('parent_id', null);

    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    return (
        <main className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hourly Sales Density</h1>
                <p className="text-sm text-gray-500">Identify peak lunch and dinner surges across the week.</p>
            </div>

            <SalesHeatmap data={data || []} />
        </main>
    );
}