import { createClient } from '@/lib/supabase/server';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { subDays, startOfDay, endOfDay } from 'date-fns';

interface PageProps {
    searchParams: Promise<{ from?: string, to?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
    const supabase = await createClient();
    const params = await searchParams;

  // 1. Fetch sales data for the last 30 days
  // RLS will automatically filter by the user's restaurant_id
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    const from = params?.from ? startOfDay(new Date(params.from)).toISOString() : thirtyDaysAgo;
    const to = params?.to ? endOfDay(new Date(params.to)).toISOString() : new Date().toISOString();
  
  const { data: salesData, error } = await supabase
    .from('sales_items')
    .select('time_ord, gross, net')
      .gte('time_ord', from)
      .lte('time_ord', to)
    .order('time_ord', { ascending: true });

  if (error) {
    return <div className="p-8 text-red-500">Error loading dashboard: {error.message}</div>;
  }

  return (
    <main className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sales Overview</h1>
              {/* Date Range Picker Component would go here */}
              <DateRangePicker />
      </div>

      <KPICards data={salesData} />

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Daily Revenue</h2>
        <SalesChart data={salesData} />
      </div>
    </main>
  );
}