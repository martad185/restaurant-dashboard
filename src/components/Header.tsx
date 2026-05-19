'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { MoreVertical, Home, Calendar, LogOut, ShieldCheck } from 'lucide-react';

interface HeaderProps {
    title: string;
    icon?: React.ReactNode;
    showChangeStore?: boolean;
}

export default function Header({ title, icon, showChangeStore = false }: HeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    // Keep track of the current date string to pass back when navigating stores
    const currentDate = searchParams.get('date') || '';
    const slug = params.slug as string;

    // Close the menu automatically if the user clicks anywhere outside of it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {

        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            // Clear the router cache and redirect to login
            router.refresh();
            router.push('/login');
        }
        router.push('/login');
    };

    return (
        <header className="bg-[#003366] text-white px-4 py-3 flex justify-between items-center relative sticky top-0 z-50 shadow-md">
            {/* Dynamic Title Context Group */}
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-bold text-lg select-none">{title}</span>
            </div>

            {/* 3-Dots Interactive Dropdown Anchor */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none"
                    aria-label="Options Menu"
                >
                    <MoreVertical size={24} />
                </button>

                {/* Dropdown Card Interface Overlay */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100">
                        {/* Header Header Brand Accent */}
                        <div className="bg-[#4A90E2] text-white px-4 py-2.5 font-bold text-[14px]">
                            Options
                        </div>

                        {/* Menu Nav Links Stack */}
                        <div className="py-1 text-gray-700">
                            {showChangeStore && (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push(`/portals/sales`);
                                    }}
                                    className="w-full px-4 py-3 text-left text-[15px] font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100"
                                >
                                    <Home size={18} className="text-gray-900" />
                                    <span>Change Store</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // Redirects back to a date selector view or triggers a date-picker state modal
                                    router.push(`/dashboard/basic/${slug}`);
                                }}
                                className="w-full px-4 py-3 text-left text-[15px] font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100"
                            >
                                <Calendar size={18} className="text-gray-900" />
                                <span>Change Day</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left text-[15px] font-medium hover:bg-red-50 text-red-600 flex items-center gap-3 transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}