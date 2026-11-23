import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const INDICES = [
  { symbol: 'NIFTY 50', price: '24,180.80', change: '+142.30', pct: '+0.59%', isUp: true },
  { symbol: 'SENSEX', price: '79,402.25', change: '+445.60', pct: '+0.56%', isUp: true },
  { symbol: 'NASDAQ 100', price: '20,845.50', change: '+198.40', pct: '+0.96%', isUp: true },
  { symbol: 'S&P 500', price: '5,885.20', change: '+32.10', pct: '+0.55%', isUp: true },
  { symbol: 'DOW JONES', price: '43,410.15', change: '-88.20', pct: '-0.20%', isUp: false },
  { symbol: 'CBOE VIX', price: '14.85', change: '-0.75', pct: '-4.81%', isUp: false },
  { symbol: 'BTC / USD', price: '94,220.00', change: '+2,150.00', pct: '+2.33%', isUp: true },
  { symbol: 'ETH / USD', price: '3,450.50', change: '+78.20', pct: '+2.32%', isUp: true },
  { symbol: 'US 10Y YIELD', price: '4.42%', change: '+0.03', pct: '+0.68%', isUp: true },
  { symbol: 'CRUDE OIL', price: '$69.80', change: '-0.45', pct: '-0.64%', isUp: false },
];

export const MarketTickerTape = () => {
  return (
    <div className="bg-[#121512] border-b border-[#343B33] overflow-hidden whitespace-nowrap select-none h-7 flex items-center">
      <div className="flex items-center animate-ticker">
        {[...INDICES, ...INDICES].map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2 px-4 border-r border-[#202720] text-[11px] font-mono"
          >
            <span className="font-bold text-[#E9E8DF] tracking-wider">{item.symbol}</span>
            <span className="text-[#E9E8DF]">{item.price}</span>
            <span
              className={`inline-flex items-center text-[10px] font-semibold ${
                item.isUp ? 'text-[#77C98B]' : 'text-[#E47770]'
              }`}
            >
              {item.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {item.pct}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
