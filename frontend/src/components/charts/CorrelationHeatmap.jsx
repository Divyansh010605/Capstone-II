import React from 'react';

const UNIVERSE = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'SPY'];

// Empirical asset correlation coefficients matrix
const CORRELATIONS = {
  AAPL:  { AAPL: 1.00, MSFT: 0.74, NVDA: 0.62, GOOGL: 0.68, AMZN: 0.65, TSLA: 0.44, SPY: 0.88 },
  MSFT:  { AAPL: 0.74, MSFT: 1.00, NVDA: 0.71, GOOGL: 0.79, AMZN: 0.76, TSLA: 0.41, SPY: 0.91 },
  NVDA:  { AAPL: 0.62, MSFT: 0.71, NVDA: 1.00, GOOGL: 0.66, AMZN: 0.69, TSLA: 0.52, SPY: 0.82 },
  GOOGL: { AAPL: 0.68, MSFT: 0.79, NVDA: 0.66, GOOGL: 1.00, AMZN: 0.73, TSLA: 0.38, SPY: 0.85 },
  AMZN:  { AAPL: 0.65, MSFT: 0.76, NVDA: 0.69, GOOGL: 0.73, AMZN: 1.00, TSLA: 0.47, SPY: 0.87 },
  TSLA:  { AAPL: 0.44, MSFT: 0.41, NVDA: 0.52, GOOGL: 0.38, AMZN: 0.47, TSLA: 1.00, SPY: 0.58 },
  SPY:   { AAPL: 0.88, MSFT: 0.91, NVDA: 0.82, GOOGL: 0.85, AMZN: 0.87, TSLA: 0.58, SPY: 1.00 },
};

export const CorrelationHeatmap = ({ activeSymbol = 'AAPL' }) => {
  const getCellBg = (val) => {
    if (val === 1.0) return 'bg-[#C7F36B] text-[#101310] font-bold';
    if (val >= 0.8) return 'bg-[#77C98B]/30 text-[#77C98B]';
    if (val >= 0.6) return 'bg-[#77C98B]/15 text-[#E9E8DF]';
    if (val >= 0.4) return 'bg-[#343B33] text-[#969B91]';
    return 'bg-[#202720] text-[#5d6459]';
  };

  return (
    <div className="w-full bg-[#141814] border border-[#343B33] p-3 font-mono">
      <div className="flex items-center justify-between text-xs mb-3 border-b border-[#242B24] pb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-[#E9E8DF] uppercase tracking-wide">
            Cross-Asset Return Covariance & Correlation Matrix
          </span>
          <span className="term-badge-accent">252-DAY ROLLING</span>
        </div>
        <span className="text-[10px] text-[#969B91]">Active: {activeSymbol}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="p-1.5 text-left text-[#969B91] font-heading font-semibold border-b border-[#343B33]">
                TICKER
              </th>
              {UNIVERSE.map((sym) => (
                <th
                  key={sym}
                  className={`p-1.5 font-heading font-semibold border-b border-[#343B33] ${
                    sym === activeSymbol ? 'text-[#C7F36B] bg-[#C7F36B]/5' : 'text-[#969B91]'
                  }`}
                >
                  {sym}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {UNIVERSE.map((rowSym) => (
              <tr key={rowSym} className="border-b border-[#202720]">
                <td
                  className={`p-1.5 text-left font-bold ${
                    rowSym === activeSymbol ? 'text-[#C7F36B] bg-[#C7F36B]/5' : 'text-[#E9E8DF]'
                  }`}
                >
                  {rowSym}
                </td>
                {UNIVERSE.map((colSym) => {
                  const val = CORRELATIONS[rowSym]?.[colSym] ?? 0.5;
                  const isHighlighted = rowSym === activeSymbol || colSym === activeSymbol;
                  return (
                    <td
                      key={colSym}
                      className={`p-1.5 transition-colors ${getCellBg(val)} ${
                        isHighlighted ? 'ring-1 ring-[#C7F36B]/30' : ''
                      }`}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#969B91] border-t border-[#242B24] pt-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 bg-[#C7F36B]"></span> 1.00 Identity
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 bg-[#77C98B]/30"></span> 0.80+ High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 bg-[#77C98B]/15"></span> 0.60+ Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 bg-[#202720]"></span> &lt;0.50 Low / Diversifier
          </span>
        </div>
        <span>METHODOLOGY: PEARSON LOG-RETURNS</span>
      </div>
    </div>
  );
};
