

import { createClient } from '@/lib/supabase/client'
import { Plus, Store, Edit2, Users, Grid3X3, ShieldCheck, LogOut } from 'lucide-react'
import Link from 'next/link'
import DeleteStoreButton from './DeleteStoreButton'
import LogoutButton from '@/components/LogoutButton'


export default async function StoresPage() {
    const supabase = await createClient()

    // Fetch stores and count related profiles in one go
    const { data: stores, error } = await supabase
        .from('restaurants')
        .select(`
      *,
      restaurant_members!inner(count)
    `)
        .not('restaurant_members.role', 'eq', 'master')
        .order('name', { ascending: true })

    if (error) return <div className="p-8 text-center text-red-500">Failed to load companies: {error.message}</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-black">
            {/* 1. Header Navigation Bar (Cleaner look to match theme) */}
            <nav className="bg-white border-b border-gray-100 px-10 py-5 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-[#EFF6FF] p-2 rounded-xl text-blue-600">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="text-2xl font-bold">Master Control</h1>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                    <Link href="/portals/stores" className="text-blue-600 font-medium flex items-center gap-2">
                        <Grid3X3 size={18} />
                        Stores
                    </Link>
                    {/* Active Navigation Style (Blue highlight) */}
                    <Link href="/portals/users"  className="text-gray-600 hover:text-black flex items-center gap-2">
                        <Users size={18} />
                        Users
                    </Link>
                    <LogoutButton />
                    {/*<button
                        onClick={handleSignOut}
                        className="text-gray-600 hover:text-red-500 flex items-center gap-2">
                        <LogOut size={18} />
                        Logout
                    </button>*/}
                </div>
            </nav>


            <main className="p-4 md:p-12 max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#EFF6FF] p-3 rounded-2xl text-blue-600">
                            <Grid3X3 size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">Stores Management</h2>
                            <p className="text-gray-500 mt-1">Add new stores, manage locations, and users linked with locations.</p>
                        </div>
                    </div>

                    {/* "+ Add New Store" Button (Blue accent, rounded) */}
                    <Link href="/portals/stores/add">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm">
                            <Plus size={18} /> Add New Store
                        </button>
                    </Link>
                </div>

                {/* <div className="max-w-6xl mx-auto">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-black tracking-tight">Stores</h1>
                        <p className="text-gray-500 mt-1">Manage locations and users linked with locations</p>
                    </div>
                    <Link href="/portals/stores/add">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100">
                            <Plus size={20} /> Add Store
                        </button>
                    </Link>
                </div>
            */}


                <div className="bg-white rounded-3xl p-4 md:p-8 shadow-xl shadow-gray-100/50">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <table className="w-full text-left border-collapse">
                        <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">

                                <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Store Name</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider text-center">Number of Users</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stores?.map((store) => (
                                <tr key={store.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{store.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                                            <Users size={16} className="text-gray-400" />
                                            {store.restaurant_members[0]?.count || 0}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${store.plan === 'premium' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {store.plan}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/portals/stores/${store.id}/edit`}>
                                                <button className="p-2.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                            </Link>
                                            <DeleteStoreButton storeId={store.id} storeName={store.name} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile List View */}
                <div className="md:hidden space-y-4">
                    {stores?.map((store) => (
                        <div key={store.id} className="p-5 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                        <Store size={18} />
                                    </div>
                                    <p className="font-bold text-gray-900">{store.name}</p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full text-xs font-bold text-gray-600">
                                    <Users size={12} /> {store.restaurant_members[0]?.count || 0}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Plan: {store.plan}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/portals/stores/${store.id}/edit`} className="flex-1">
                                    <button className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm">Edit</button>
                                </Link>
                                <DeleteStoreButton storeId={store.id} storeName={store.name} />
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </main>
            <footer className="text-center text-sm text-gray-400 py-10">
                You are managing the Master Control workspace.
            </footer>
        </div>
    )
}