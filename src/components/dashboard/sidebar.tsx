"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UtensilsCrossed,
    PieChart,
    Clock,
    ArrowLeftRight,
    Menu,
    X
} from 'lucide-react';

const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Channels', href: '/dashboard/channels', icon: ArrowLeftRight },
    { name: 'Categories', href: '/dashboard/categories', icon: PieChart },
    { name: 'Heatmap', href: '/dashboard/heatmap', icon: Clock },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Header: Only visible on small screens */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
                <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                   {/* <UtensilsCrossed size={20} /> */}
                    Slowey Sales App
                </h2>
                <button onClick={toggleSidebar} className="p-2 text-gray-600">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay: Closes sidebar when clicking outside on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-blue-600 hidden md:flex items-center gap-2">
                        {/* <UtensilsCrossed size={24} /> */}
                        Slowey Sales App
                    </h2>
                </div>

                <nav className="flex-1 px-4 flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)} // Close on click for mobile
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}