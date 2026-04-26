"use client";

import { useRouter } from "next/navigation";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
    ResponsiveContainer,
  Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';

export interface Sales_Items {
  time_ord: string;
  gross: number;
}

// 2. Define the shape of our chart data
export interface ChartDataPoint {
    date: string;
    amount: number;
}

interface ChartClickState {
    activeLabel?: string; // This is the 'date' from your XAxis
    activePayload?: Array<{
        payload: ChartDataPoint;
    }>;
}

export function SalesChart({ data }: { data: Sales_Items[] }) {

    const router = useRouter();
    // 3. Use Record<string, ChartDataPoint> to tell TS exactly what the accumulator is
    const groupedData = data.reduce<Record<string, ChartDataPoint>>((acc, sales) => {
        const day = format(parseISO(sales.time_ord), 'yyyy-MM-dd');

        if (!acc[day]) {
            acc[day] = { date: day, amount: 0 };
        }

        acc[day].amount += sales.gross;
        return acc;
    }, {});

  // 2. Convert object back to array for Recharts
    const chartData = Object.values(groupedData);



    // Handle the click event
    const handleClick = (state: ChartClickState) => {
        if (state && state.activeLabel) {
            // Assuming activeLabel is the date string (e.g., "2026-04-20")
            const selectedDate = state.activeLabel;

            // Navigate to channels page with the date filter in the URL
            router.push(`/dashboard/channels?from=${selectedDate}&to=${selectedDate}`);
        }
    };



  return (
    <div className="h-[350px] w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider">
        Revenue Trend (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
              <LineChart
                  data={chartData}
                  onClick={(nextState) => handleClick(nextState as ChartClickState)} // Attach the click handler to the chart
              >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
                      //tickFormatter={(value) => { return `$${value}`; }}
            tickFormatter = {(value) => `$${value.toLocaleString()}`}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
                  <Tooltip
                      contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                      }}
                      // Explicitly cast the value to number or check its type to satisfy TS
                      formatter={(value: unknown) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                      /*formatter={(value: number | string | Array<number | string>) => {
                          const numericValue = typeof value === 'number' ? value : Number(value);
                          return [`$${numericValue.toFixed(2)}`, 'Revenue'];
                      }}*/
                  />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}