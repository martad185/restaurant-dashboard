import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { startOfDay, endOfDay, format } from 'date-fns';
import { SalesListClient } from '@/components/dashboard/sales-list-client';


interface RestaurantSales {
    id: number;
    name: string;
    slug: string;
    sales: { gross: number; }[];
}

export default async function SalesPortalPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();
    const dayName = format(new Date(), 'EEEE');

    const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, slug, sales_items(gross)')
        .filter('sales_items.time_ord', 'gte', todayStart)
        .filter('sales_items.time_ord', 'lte', todayEnd);

    if (error) return <div className="p-4">Error loading data.</div>;

    const rawData = (data as unknown) as RestaurantSales[];
   

    const restaurantSales = rawData.map((res) => ({
        id: res.id,
        name: res.name,
        slug: res.slug,
        todayTotal: res.sales.reduce((sum: number, s) => sum + s.gross, 0)
    })).sort((a, b) => a.name.localeCompare(b.name));

    return <SalesListClient initialData={restaurantSales} dayName={dayName} />;
}