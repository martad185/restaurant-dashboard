import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { startOfDay, endOfDay, format } from 'date-fns';
import { SalesListClient } from '@/components/dashboard/sales-list-client';

// Define the shape of the database join
interface RawRestaurantData {
    id: string;
    name: string;
    slug: string;
    sales_items: {
        gross: number;
    }[];
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
        .select('id, name, slug, restaurant_members!inner(user_id),sales_items(gross)')
        .eq('restaurant_members.user_id', user.id)
        .filter('sales_items.time_ord', 'gte', todayStart)
        .filter('sales_items.time_ord', 'lte', todayEnd);

    if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

    // Cast the raw data to our interface safely
    const rawData = (data as unknown) as RawRestaurantData[];

    const restaurantSales = rawData.map((res) => {
        const total = res.sales_items && res.sales_items.length > 0 ? res.sales_items.reduce((sum, item) => sum + (item.gross || 0), 0) : 0;
        return {
            id: res.id,
            name: res.name,
            slug: res.slug,
            todayTotal: total
        };
    }).sort((a, b) => a.name.localeCompare(b.name));

    return <SalesListClient initialData={restaurantSales} dayName={dayName} />;
}