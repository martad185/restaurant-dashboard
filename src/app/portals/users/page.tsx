import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, UserPlus, Users, Grid3X3, LogOut, ShieldCheck } from 'lucide-react';
import DeleteUserButton from './DeleteUserButton'


const handleSignOut = async () => {
    const supabase = createClient();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Error signing out:', error.message);
    } else {
        // Clear the router cache and redirect to login
        router.refresh();
        router.push('/login');
    }
};

export default async function UsersPortalPage() {
    const supabase = await createClient();
    

    // 1. Get current user's ID
    const { data: { user } } = await supabase.auth.getUser();



    // 2. Fetch users, excluding the logged-in user
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, full_name')
        .neq('id', user?.id) // Filter out the logged-in user
        .order('first_name', { ascending: true })
        .order('last_name', { ascending: true }); // Order by first_name and then last_name


    

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

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                    <Link href="/portals/stores" className="text-gray-600 hover:text-black flex items-center gap-2">
                        <Grid3X3 size={18} />
                        Stores
                    </Link>
                    {/* Active Navigation Style (Blue highlight) */}
                    <Link href="/portals/users" className="text-blue-600 font-medium flex items-center gap-2">
                        <Users size={18} />
                        Users
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="text-gray-600 hover:text-red-500 flex items-center gap-2">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </nav>

            {/* 2. Page Content Container */}
            <main className="p-4 md:p-12 max-w-[1600px] mx-auto">
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
                    <Link href="/portals/users/add">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm">
                            <UserPlus size={18} /> Add New User
                        </button>
                    </Link>
                </div>

                {/* 3. The Main Data Container */}
                <div className="bg-white rounded-3xl p-4 md:p-8 shadow-xl shadow-gray-100/50">

                    {/* DESKTOP TABLE: Hidden on small screens (hidden md:block) */}
                    <div className="hidden md:block">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="py-5 px-8 text-sm font-semibold text-gray-500 uppercase tracking-wider">First Name</th>
                                    <th className="py-5 px-8 text-sm font-semibold text-gray-500 uppercase tracking-wider">Last Name</th>
                                    <th className="py-5 px-8 text-sm font-semibold text-gray-500 uppercase tracking-wider">Email Address</th>
                                    <th className="py-5 px-8 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.map((userItem) => (
                                    <tr key={userItem.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5 px-8 font-semibold text-black">{userItem.first_name}</td>
                                        <td className="py-5 px-8 font-semibold text-black">{userItem.last_name}</td>
                                        <td className="py-5 px-8 text-gray-800 font-mono text-sm">{userItem.email}</td>
                                        <td className="py-5 px-8 text-right flex justify-end gap-3">
                                            <Link href={`/portals/users/${userItem.id}/edit`}>
                                                <button className="p-2.5 rounded-lg text-blue-600 bg-[#EFF6FF] hover:bg-blue-100"><Edit2 size={16} /></button>
                                            </Link>
                                            <DeleteUserButton
                                                userId={userItem.id}
                                                userName={`${userItem.first_name} ${userItem.last_name}`}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE LIST: Visible only on small screens (block md:hidden) */}
                    <div className="block md:hidden space-y-4">
                        {users?.map((userItem, index) => (
                            <div key={userItem.id} className="p-4 border border-gray-100 rounded-2xl bg-[#FDFDFD]">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-2">
                                        <Link href={`/portals/users/${userItem.id}/edit`}>
                                            <button className="p-2 rounded-lg text-blue-600 bg-[#EFF6FF]"><Edit2 size={14} /></button>
                                        </Link>
                                        <DeleteUserButton userId={userItem.id} userName={`${userItem.first_name} ${userItem.last_name}`} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-black">{userItem.full_name} </p>
                                    <p className="text-sm text-gray-500 break-all">{userItem.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* 4. Footer (Similar to image_1.png) */}
            <footer className="text-center text-sm text-gray-400 py-10">
                You are managing the Master Control workspace.
            </footer>
        </div>
    );
}