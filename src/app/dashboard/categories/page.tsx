import { createClient } from '@/lib/supabase/server';
import { CategoryDrilldown } from '@/components/dashboard/category-drilldown';
import { redirect } from 'next/navigation';

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch orders with item names and categories
  // Note: RLS handles restaurant_id automatically
  const { data, error } = await supabase
    .from('sales_items')
    .select('gross, category, descript')
    .is('parent_id', null);

  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <main className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Category & Product Performance</h1>
        <p className="text-sm text-gray-500">Click a category bar to see individual product sales.</p>
      </div>

      <CategoryDrilldown data={data || []} />
    </main>
  );
}