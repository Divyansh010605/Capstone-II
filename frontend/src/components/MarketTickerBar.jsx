import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DEFAULT_TICKERS = [
  { symbol: 'AAPL',  price: 185.50, chg: +1.26,  pct: +0.69 },
  { symbol: 'MSFT',  price: 422.50, chg: -2.50,  pct: -0.59 },
  { symbol: 'NVDA',  price: 138.40, chg: +4.30,  pct: +3.21 },
  { symbol: 'GOOGL', price: 176.80, chg: +0.90,  pct: +0.51 },
  { symbol: 'AMZN',  price: 186.10, chg: +1.80,  pct: +0.98 },
  { symbol: 'TSLA',  price: 254.20, chg: -6.30,  pct: -2.42 },
  { symbol: 'META',  price: 582.00, chg: +7.40,  pct: +1.29 },
  { symbol: 'SPY',   price: 585.00, chg: +1.10,  pct: +0.19 },
  { symbol: 'QQQ',   price: 509.00, chg: +2.60,  pct: +0.51 },
  { symbol: 'BTC-USD', price: 97420.00, chg: +840.00, pct: +0.87 },
];

export const MarketTickerBar = ({ availableStocks = [] }) => {
  const [tickers, setTickers] = useState(DEFAULT_TICKERS);
  const containerRef = useRef(null);

  // Simulate slight price drift for live feel
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => {
          const drift = (Math.random() - 0.49) * (t.price * 0.001);
          const newPrice = +(t.price + drift).toFixed(2);
          const totalChg = +(t.chg + drift).toFixed(2);
          const totalPct = +((totalChg / (t.price - t.chg)) * 100).toFixed(2);
          return { ...t, price: newPrice, chg: totalChg, pct: totalPct };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...tickers, ...tickers]; // duplicate for seamless loop

  return (
    <div className="w-full overflow-hidden bg-[#090d16]/80 border-b border-white/5 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="flex gap-0 ticker-scroll"
        style={{ animation: 'tickerScroll 36s linear infinite' }}
      >
        {doubled.map((t, idx) => {
          const isUp = t.chg >= 0;
          return (
            <div
              key={`${t.symbol}-${idx}`}
              className="flex items-center gap-2 px-5 py-2 border-r border-white/5 flex-shrink-0 select-none"
            >
              <span className="text-xs font-mono font-bold text-white">{t.symbol}</span>
              <span className="text-xs font-mono text-slate-200">${t.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span
                className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {isUp ? '+' : ''}{t.pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

