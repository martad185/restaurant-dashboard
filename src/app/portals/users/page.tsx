import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Edit2, Trash2, UserPlus, Users, Grid3X3, LogOut, ShieldCheck } from 'lucide-react';

export default async function UsersPortalPage() {
    const supabase = await createClient();

    // 1. Get current user's ID
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Fetch users, excluding the logged-in user
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', user?.id) // Filter out the logged-in user
        .order('full_name', { ascending: true }); // Order by first_name

    return (
        // Main background: very light grey/white (similar to image_1.png)
        <div className="min-h-screen bg-[#F8F9FA] text-black">

            {/* 1. Header Navigation Bar (Cleaner look to match theme) */}
            <nav className="bg-white border-b border-gray-100 px-10 py-5 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-[#EFF6FF] p-2 rounded-xl text-blue-600">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="text-2xl font-bold">Master Control</h1>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/portal" className="text-gray-600 hover:text-black flex items-center gap-2">
                        <Grid3X3 size={18} />
                        Workspace
                    </Link>
                    {/* Active Navigation Style (Blue highlight) */}
                    <Link href="/portal/users" className="text-blue-600 font-medium flex items-center gap-2">
                        <Users size={18} />
                        User Management
                    </Link>
                    <button className="text-gray-600 hover:text-red-500 flex items-center gap-2">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* 2. Page Content Container */}
            <main className="p-12 max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#EFF6FF] p-3 rounded-2xl text-blue-600">
                            <Users size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">User Management</h2>
                            <p className="text-gray-500 mt-1">Add new accounts, users, and manage access.</p>
                        </div>
                    </div>

                    {/* "+ Add New User" Button (Blue accent, rounded) */}
                    <button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm">
                        <UserPlus size={18} /> Add New User
                    </button>
                </div>

                {/* 3. The Main Data Card (White, elevated) */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-5 px-4 font-semibold text-gray-500 w-20 text-center">#</th>
                                <th className="py-5 px-4 font-semibold text-gray-500">Full Name</th>
                                <th className="py-5 px-4 font-semibold text-gray-500">Email Address</th>
                                <th className="py-5 px-4 font-semibold text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((userItem, index) => (
                                <tr key={userItem.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    {/* Number column is faint gray */}
                                    <td className="py-5 px-4 font-medium text-gray-400 text-center">{index + 1}</td>
                                    <td className="py-5 px-4 font-semibold text-black">{userItem.full_name || 'N/A'}</td>
                                    <td className="py-5 px-4 text-gray-800 font-mono text-sm">{userItem.email}</td>
                                    <td className="py-5 px-4 text-right flex justify-end gap-3">
                                        {/* Action Buttons: Minimalist with subtle colors */}
                                        <button className="p-2.5 rounded-lg text-blue-600 bg-[#EFF6FF] hover:bg-blue-100 transition-colors" title="Edit User">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors" title="Delete User">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Handling empty states gracefully */}
                    {(!users || users.length === 0) && (
                        <div className="text-center py-24 text-gray-500">
                            <Users size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-xl font-semibold text-gray-800">No additional users found.</p>
                            <p>Apart from yourself, there are no other profiles in the system.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* 4. Footer (Similar to image_1.png) */}
            <footer className="text-center text-sm text-gray-400 py-10">
                You are managing the Master Control workspace.
            </footer>
        </div>
    );
}