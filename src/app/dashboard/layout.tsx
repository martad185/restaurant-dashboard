import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                {/* Adds padding to prevent content hiding behind mobile header */}
                <div className="min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}