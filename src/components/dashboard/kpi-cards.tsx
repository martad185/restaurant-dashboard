interface Sales_Items {
  gross: number;
  net: number;
  transact: string | number;
}

export function KPICards({ data }: { data: Sales_Items[] }) {
  // Aggregate data
  const grossRevenue = data.reduce((sum, sales) => sum + (sales.gross || 0), 0);
  const netRevenue = data.reduce((sum, sales) => sum + (sales.net || 0), 0);

  const uniqueTransactions = new Set(data.map((item) => item.transact));
  const transactionCount = uniqueTransactions.size;

  const avgTransactionValue = transactionCount > 0 ? grossRevenue / transactionCount : 0; 


  const stats = [
    {
      name: 'Gross Revenue',
      value: `$${grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      name: 'Net Revenue',
      value: `$${netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
        name: 'Transactions',
        value: transactionCount.toString(),
    },
    {
        name: 'Avg Sales per Tranasction',
        value: `$${avgTransactionValue.toFixed(2)}`,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {stat.name}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}