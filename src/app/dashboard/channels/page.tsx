import { createClient } from '@/lib/supabase/server';
import { ChannelCharts } from '@/components/dashboard/channel-charts';
import { redirect } from 'next/navigation';

export default async function ChannelsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all orders - filtering out modifiers
  const { data, error } = await supabase
    .from('sales_items')
    .select('gross, channel,id')
    .is('parent_id', null);

  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <main className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales by Channel</h1>
        <p className="text-sm text-gray-500">Eat-in vs. Carryout vs. Online</p>
      </div>

      <ChannelCharts data={data || []} />
    </main>
  );
}