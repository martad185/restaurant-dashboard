import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { router } from 'next/navigation';
import { LayoutDashboard, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PortalSelect() {

    const handleSignOut = async () => {
        const supabase = createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            // Clear the router cache and redirect to login
            router.refresh();
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                    <ShieldCheck className="text-blue-600" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Master Control</h1>
                <p className="text-gray-500 mt-2">Select a workspace to continue</p>
            </div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

                {/* Sales Portal Option */}
                <Link
                    href="/portals/sales"
                    className="group relative bg-white p-8 rounded-2xl border-2 border-transparent hover:border-blue-500 shadow-sm transition-all duration-300 flex flex-col items-start"
                >
                    <div className="p-4 bg-blue-50 rounded-xl mb-6 group-hover:bg-blue-100 transition-colors">
                        <LayoutDashboard className="text-blue-600" size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Sales Portal</h2>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Monitor revenue trends, analyze channel performance, and view sales heatmaps across your restaurants.
                    </p>
                    <div className="mt-auto flex items-center text-blue-600 font-semibold text-sm">
                        Enter Dashboard <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* Users Portal Option */}
                <Link
                    href="/portals/users"
                    className="group relative bg-white p-8 rounded-2xl border-2 border-transparent hover:border-blue-500 shadow-sm transition-all duration-300 flex flex-col items-start"
                >
                    <div className="p-4 bg-blue-50 rounded-xl mb-6 group-hover:bg-blue-100 transition-colors">
                        <Users className="text-blue-600" size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">User Management</h2>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Add new accounts and users.
                    </p>
                    <div className="mt-auto flex items-center text-blue-600 font-semibold text-sm">
                        Manage Users <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

            </div>

            {/* Footer link */}
            <button
                onClick={handleSignOut}
                className="mt-12 text-sm text-gray-400 hover:text-red-500 hover:font-semibold transition-all duration-200 flex items-center gap-2">
                Sign out of Master Account
            </button>
        </div>
    );
}