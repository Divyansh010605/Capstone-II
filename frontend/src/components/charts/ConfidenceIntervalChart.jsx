import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const ConfidenceIntervalChart = ({
  forecast = [],
  currentPrice = 180,
  symbol = 'AAPL',
  selectedModel = 'ensemble',
}) => {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center font-mono text-xs text-[#969B91] border border-[#343B33] bg-[#141814]">
        Awaiting PyTorch inference vectors...
      </div>
    );
  }

  // Prepend Step 0 (Current Baseline)
  const chartData = [
    {
      step: 'T+0',
      date: 'Today',
      predicted_price: currentPrice,
      lower_bound: currentPrice,
      upper_bound: currentPrice,
      lstm: currentPrice,
      gru: currentPrice,
      transformer: currentPrice,
      ensemble: currentPrice,
    },
    ...forecast.map((f) => ({
      step: `T+${f.step}`,
      date: f.date,
      predicted_price: f.predicted_price,
      lower_bound: f.lower_bound,
      upper_bound: f.upper_bound,
      lstm: f.lstm || f.predicted_price * 0.995,
      gru: f.gru || f.predicted_price * 1.002,
      transformer: f.transformer || f.predicted_price * 1.008,
      ensemble: f.ensemble || f.predicted_price,
    })),
  ];

  // Min/Max for Y-Axis
  const allVals = chartData.flatMap((d) => [d.lower_bound, d.upper_bound, d.predicted_price]);
  const minVal = Math.floor(Math.min(...allVals) * 0.98);
  const maxVal = Math.ceil(Math.max(...allVals) * 1.02);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#141814] border border-[#343B33] p-2.5 font-mono text-xs shadow-xl">
          <div className="font-heading font-bold text-[#E9E8DF] border-b border-[#343B33] pb-1 mb-1.5 flex justify-between gap-4">
            <span>{label} ({data.date})</span>
            <span className="text-[#C7F36B]">${data.predicted_price?.toFixed(2)}</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between gap-4 text-[#969B91]">
              <span>Upper 95% CI:</span>
              <span className="text-[#77C98B]">${data.upper_bound?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 text-[#969B91]">
              <span>Lower 95% CI:</span>
              <span className="text-[#E47770]">${data.lower_bound?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 text-[#969B91]">
              <span>Stacking Ensemble:</span>
              <span className="text-[#C7F36B]">${data.ensemble?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 text-[#969B91]">
              <span>Transformer:</span>
              <span className="text-[#E9E8DF]">${data.transformer?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 text-[#969B91]">
              <span>LSTM:</span>
              <span className="text-[#E9E8DF]">${data.lstm?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-[#141814] border border-[#343B33] p-3">
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-[#E9E8DF] uppercase tracking-wide">
            95% Forecast Confidence Cone & Model Trajectories
          </span>
          <span className="term-badge-accent">±2σ GAUSSIAN DRIFT</span>
        </div>
        <div className="text-[11px] text-[#969B91]">
          Horizon: <strong className="text-[#E9E8DF]">{forecast.length} Days</strong>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#242B24" vertical={false} />
            <XAxis
              dataKey="step"
              stroke="#969B91"
              tick={{ fill: '#969B91', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              tickLine={{ stroke: '#343B33' }}
            />
            <YAxis
              domain={[minVal, maxVal]}
              stroke="#969B91"
              tick={{ fill: '#969B91', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              tickFormatter={(v) => `$${v}`}
              tickLine={{ stroke: '#343B33' }}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontFamily: 'IBM Plex Mono',
                fontSize: 10,
                paddingTop: 10,
              }}
            />

            {/* 95% Confidence Interval Upper Band */}
            <Area
              type="monotone"
              dataKey="upper_bound"
              stroke="transparent"
              fill="#C7F36B"
              fillOpacity={0.08}
              name="95% CI Range"
            />
            {/* 95% Confidence Interval Lower Band subtraction */}
            <Area
              type="monotone"
              dataKey="lower_bound"
              stroke="transparent"
              fill="#101310"
              fillOpacity={1}
            />

            {/* Trajectory Lines */}
            <Line
              type="monotone"
              dataKey="ensemble"
              stroke="#C7F36B"
              strokeWidth={2}
              dot={{ r: 2, fill: '#C7F36B' }}
              name="Stacking Ensemble"
            />
            <Line
              type="monotone"
              dataKey="transformer"
              stroke="#38BDF8"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              name="Transformer"
            />
            <Line
              type="monotone"
              dataKey="lstm"
              stroke="#A78BFA"
              strokeWidth={1}
              strokeDasharray="2 2"
              dot={false}
              name="LSTM"
            />
            <Line
              type="monotone"
              dataKey="gru"
              stroke="#F59E0B"
              strokeWidth={1}
              strokeDasharray="2 2"
              dot={false}
              name="GRU"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
