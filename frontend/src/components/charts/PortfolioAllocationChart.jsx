import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = [
  '#C7F36B', // Accent
  '#77C98B', // Positive green
  '#38BDF8', // Sky
  '#A78BFA', // Purple
  '#F59E0B', // Amber
  '#E47770', // Red
  '#969B91', // Muted
];

export const PortfolioAllocationChart = ({
  positions = [],
  cash = 25000,
  totalValue = 125000,
}) => {
  const chartData = [
    ...positions.map((p) => ({
      name: p.symbol,
      value: typeof p.current_value === 'number' ? p.current_value : 0,
      pct: p.allocation_pct || 0,
    })),
    ...(cash > 0
      ? [
          {
            name: 'USD CASH',
            value: cash,
            pct: totalValue > 0 ? +((cash / totalValue) * 100).toFixed(1) : 0,
          },
        ]
      : []),
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#141814] border border-[#343B33] p-2 font-mono text-xs shadow-xl">
          <div className="font-heading font-bold text-[#E9E8DF]">{data.name}</div>
          <div className="text-[11px] text-[#969B91]">
            Valuation: <strong className="text-[#C7F36B]">${data.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className="text-[11px] text-[#969B91]">
            Allocation: <strong className="text-[#E9E8DF]">{data.pct}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-[#141814] border border-[#343B33] p-3 flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs font-mono mb-2 border-b border-[#242B24] pb-1.5">
        <span className="font-heading font-bold text-[#E9E8DF] uppercase tracking-wide">
          Asset Allocation
        </span>
        <span className="text-[11px] text-[#969B91]">
          {positions.length} Active Positions
        </span>
      </div>

      <div className="h-52 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={76}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#101310"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono border-t border-[#242B24] pt-2">
        {chartData.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span
                className="w-2 h-2 shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="truncate text-[#969B91]">{item.name}</span>
            </div>
            <span className="font-semibold text-[#E9E8DF]">{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
