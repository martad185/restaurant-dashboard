import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditStoreForm from './EditStoreForm'
import { link } from 'node:fs/promises';


interface RestaurantMember {
    profiles: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string;
    } | null;
}

interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
};

    export default async function EditStorePage({
        params
    }: {
        params: Promise<{ id: string }>
        }) {
        const { id } = await params;
    const supabase = await createClient()

    // 1. Fetch Store details
    const { data: storeData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()

    //const store = storeData as Store;

    if (!storeData) return notFound()

    // 2. Fetch users already linked to THIS store
    const { data: linkedMembers } = await supabase
        .from('restaurant_members')
        .select(`
            profiles (
                id,
                first_name,
                last_name,
                email)
            
        `)
            .eq('restaurant_id', id);

        // 3. Format the data to match your Profile interface
        // membersData looks like [{ profiles: { id: '...', ... } }]
        const initialLinkedUsers: Profile[] = (linkedMembers as unknown as RestaurantMember[])
            ?.map((row) => row.profiles)
            .filter((p): p is Profile => p !== null) || [];

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-12">
            <EditStoreForm
                store={storeData}
                initialLinkedUsers={initialLinkedUsers}
            />
        </div>
    )
}