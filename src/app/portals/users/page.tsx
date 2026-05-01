import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Edit, Trash2, UserPlus } from 'lucide-react'; // Lucide icons for actions

export default async function UsersPortalPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch users from your profiles table
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', user?.id)
        .order('full_name', { ascending: true });

    return (
        <div className="min-h-screen bg-[#243c5a] text-white p-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl font-semibold">Slowey Sales Users Portal</h1>
                <button className="bg-gray-800 px-4 py-1 rounded text-sm hover:bg-gray-700">Logout</button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex w-full mb-12">
                <div className="flex-1 bg-blue-600 text-center py-4 font-bold border-r border-blue-700 cursor-pointer">
                    USER
                </div>
                <div className="flex-1 bg-[#1e2f47] text-center py-4 font-bold text-gray-400 hover:text-white cursor-pointer">
                    STORE
                </div>
            </div>

            <h2 className="text-4xl text-center mb-10 font-light">User</h2>

            {/* Add Button */}
            <button className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2 px-4 py-2 rounded mb-6 text-sm">
                <UserPlus size={16} /> + Add New User
            </button>

            {/* Table Section */}
            <div className="bg-white rounded-sm overflow-hidden text-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="p-4 font-bold w-16">#</th>
                            <th className="p-4 font-bold">Full Name</th>
                            <th className="p-4 font-bold">User Name</th>
                            <th className="p-4 font-bold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user, index) => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold">{index + 1}</td>
                                <td className="p-4">{user.full_name || 'N/A'}</td>
                                <td className="p-4">{user.email || 'N/A'}</td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button className="bg-cyan-500 p-2 rounded text-white hover:bg-cyan-600">
                                        <Edit size={16} />
                                    </button>
                                    <button className="bg-red-500 p-2 rounded text-white hover:bg-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}