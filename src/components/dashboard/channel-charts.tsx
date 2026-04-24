"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface Sales_Items {
    gross: number;
    channel: string;
}

// 1. Define the shape of a single channel's stats
interface ChannelMetric {
    channel: string;
    gross: number;
    count: number;
    avg: number;
}


const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function ChannelCharts({ data }: { data: Sales_Items[] }) {
    // 1. Transform data for the chart and table
    const channelMetrics = data.reduce<Record<string, ChannelMetric>>((acc, sales) => {
        const channel = sales.channel || 'Unknown';
        if (!acc[channel]) {
            acc[channel] = { channel: channel, gross: 0, count: 0, avg: 0 };
        }
        acc[channel].gross += sales.gross;
        acc[channel].count += 1;
        acc[channel].avg = acc[channel].gross / acc[channel].count;
        return acc;
    }, {});

    const chartData = Object.values(channelMetrics).map(item => ({
        ...item,
        avg: item.gross / item.count
    }));

    return (
        <div className="space-y-8">
            {/* Bar Chart Section */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-sm font-semibold text-gray-500 mb-6 uppercase">Gross Sales by Channel</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `$${val}`}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                formatter={(val: unknown) => [`$${Number(val).toLocaleString()}`, 'Gross Sales']}
                            />
                            <Bar dataKey="gross" radius={[4, 4, 0, 0]} barSize={60}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Metrics Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Channel</th>
                            <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Transactions</th>
                            <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Gross Sales</th>
                            <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Avg. Order Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {chartData.map((channel: ChannelMetric) => (
                            <tr key={channel.channel} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900">{channel.channel}</td>
                                <td className="p-4 text-gray-600">{channel.count}</td>
                                <td className="p-4 text-gray-600">${channel.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="p-4 text-gray-600">${channel.avg.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}