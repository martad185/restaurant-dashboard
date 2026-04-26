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
    transact: string | number;
}

// Define the shape of a single channel's stats
interface ChannelMetric {
    channel: string;
    gross: number;
    count: number;
    avg: number;
}

//Temporary interface for the accumulator to track unique IDs
interface Accumulator {
    name: string;
    gross: number;
    transactionIds: Set<string | number>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function ChannelCharts({ data }: { data: Sales_Items[] }) {

    //Group data and track unique transaction IDs per channel
    const channelGroups = data.reduce<Record<string, Accumulator>>((acc, sales) => {
        const channel = sales.channel || 'Unknown';

        if (!acc[channel]) {
            acc[channel] = {
                name: channel,
                gross: 0,
                transactionIds: new Set()
            };
        }
        acc[channel].gross += sales.gross;
        acc[channel].transactionIds.add(sales.transact); // Add ID to the Set

        return acc;
    }, {});
    //  Transform data for the chart and table
   
    const chartData: ChannelMetric[] = Object.values(channelGroups).map((item) => { 
        const uniqueCount = item.transactionIds.size;
        return {
            channel: item.name,
            gross: item.gross,
            count: uniqueCount,
            avg: uniqueCount > 0 ? item.gross / uniqueCount : 0
        };
    });

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
                            <th className="p-4 text-xs font-semibold text-gray-600 uppercase">Avg. Transaction Value</th>
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