'use client'; // This is the magic line

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];


interface Graph{
    name: string,
    total: number
}

interface GraphProps {
    ChartData: Graph[]
}

export default function GraphClient({ chartData }: { chartData: Graph[] }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="h-[250px] w-full max-w-md my-6">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, 'Gross Sales']}//typeof value === 'number' ? [`€${value.toFixed(2)}`, 'Net Sales'] : [value, 'Net Sales']}
                            //formatter={(val: unknown) => [`$${Number(val).toLocaleString()}`, 'Gross Sales']}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* List with matching colors */}
            <div className="w-full px-4 space-y-2">
                {chartData.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            >
                                <span className="rotate-180 text-[8px]">▶</span>
                            </div>
                            <span className="text-[15px] font-medium text-gray-700">{item.name}</span>
                        </div>
                        <div className="bg-[#3b82f6] text-white px-3 py-1 rounded text-sm font-bold min-w-[85px] text-right">
                            {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}