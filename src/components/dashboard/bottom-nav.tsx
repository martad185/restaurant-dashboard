"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ArrowLeftRight,
    PieChart,
    Clock
} from 'lucide-react';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Channels', href: '/dashboard/channels', icon: ArrowLeftRight },
    { name: 'Menu', href: '/dashboard/categories', icon: PieChart },
    { name: 'Times', href: '/dashboard/heatmap', icon: Clock },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-50 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`p-1 rounded-md transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                            }`}>
                            <Icon size={22} />
                        </div>
                        <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}