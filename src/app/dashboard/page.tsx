import { createClient } from '@/lib/supabase/server';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { format, subDays } from 'date-fns';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch sales data for the last 30 days
  // RLS will automatically filter by the user's restaurant_id
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  
  const { data: salesData, error } = await supabase
    .from('orders')
    .select('created_at, total_amount, net_amount, status')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true });

  if (error) {
    return <div className="p-8 text-red-500">Error loading dashboard: {error.message}</div>;
  }

  return (
    <main className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sales Overview</h1>
        {/* Date Range Picker Component would go here */}
      </div>

      <KPICards data={salesData} />

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Daily Revenue</h2>
        <SalesChart data={salesData} />
      </div>
    </main>
  );
}