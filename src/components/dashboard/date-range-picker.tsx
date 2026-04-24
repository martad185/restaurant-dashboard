"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export function DateRangePicker() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current values from URL or default to empty
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';

    const handleUpdate = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">From</label>
                <input
                    type="date"
                    value={from}
                    onChange={(e) => handleUpdate('from', e.target.value)}
                    className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">To</label>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => handleUpdate('to', e.target.value)}
                    className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
        </div>
    );
}