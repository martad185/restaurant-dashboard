import { createClient } from '@/lib/supabase/server'
import EditUserForm from './EditUserForm' // We will create this next
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditUserPage({
    params
}: {
    params: Promise<{ id: string }>
    }) {
    const { id } = await params;
    const supabase = await createClient()

    // Fetch the specific user's current data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (!profile) return notFound()

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-12">
            <div className="max-w-2xl mx-auto">
                <Link href="/portal/users" className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                    <ChevronLeft size={20} /> Back to Users
                </Link>

                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50">
                    <h1 className="text-2xl font-bold mb-2">Edit User</h1>
                    <p className="text-gray-500 mb-8">Updating profile for {profile.email}</p>

                    {/* Pass the existing data to a Client Component Form */}
                    <EditUserForm profile={profile} />
                </div>
            </div>
        </div>
    )
}