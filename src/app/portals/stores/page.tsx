import { createClient } from '@/lib/supabase/server'
import { Plus, Store, Phone, MapPin, Edit3, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default async function StoresPage() {
    const supabase = await createClient()
    const { data: stores } = await supabase
        .from('restaurants')
        .select('*')
        .order('name', { ascending: true })

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-black tracking-tight">Store Management</h1>
                    <p className="text-gray-500 mt-1">Manage physical locations and link users with a location</p>
                </div>
                <Link href="/portals/stores/add">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100">
                        <Plus size={20} /> Add New Store
                    </button>
                </Link>
            </div>

            {/* Grid of Store Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores?.map((store) => (
                    <div key={store.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-100/50 border border-transparent hover:border-blue-100 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-[#F0F7FF] p-3 rounded-2xl text-blue-600">
                                <Store size={24} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${store.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                {store.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">{store.name}</h3>

                        <div className="flex gap-3 pt-4 border-t border-gray-50">
                            <Link href={`/portal/stores/${store.id}/edit`} className="flex-1">
                                <button className="w-full py-2.5 rounded-lg bg-gray-50 text-gray-600 font-semibold text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex justify-center items-center gap-2">
                                    <Edit3 size={14} /> Edit
                                </button>
                            </Link>
                            <button className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {(!stores || stores.length === 0) && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <Store size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No stores found. Start by adding your first location.</p>
                </div>
            )}
        </div>
    )
}