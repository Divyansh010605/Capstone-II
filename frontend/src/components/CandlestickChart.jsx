import React, { useState, useRef, useEffect } from 'react';
import { Eye, Layers, Maximize2 } from 'lucide-react';

export const CandlestickChart = ({ historyData, symbol, period, setPeriod }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const canvasRef = useRef(null);

  const records = historyData?.data || [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || records.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth;
    const height = 440;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Layout configuration
    const padding = { top: 20, right: 60, bottom: 60, left: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const priceChartHeight = chartHeight * 0.75;
    const volumeChartHeight = chartHeight * 0.20;
    const volumeTop = padding.top + priceChartHeight + 15;

    // Determine scale bounds
    const minPrice = Math.min(...records.map((r) => r.low));
    const maxPrice = Math.max(...records.map((r) => r.high));
    const priceRange = maxPrice - minPrice || 1;
    const maxVolume = Math.max(...records.map((r) => r.volume)) || 1;

    const getY = (val) => padding.top + (1 - (val - minPrice) / priceRange) * priceChartHeight;
    const getX = (idx) => padding.left + (idx + 0.5) * (chartWidth / records.length);
    const candleWidth = Math.max(2, (chartWidth / records.length) * 0.65);

    // Draw horizontal grid lines & price labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px JetBrains Mono';
    ctx.textAlign = 'left';

    const numGridLines = 5;
    for (let i = 0; i <= numGridLines; i++) {
      const p = minPrice + (i / numGridLines) * priceRange;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(`$${p.toFixed(2)}`, width - padding.right + 8, y + 4);
    }

    // 1. Draw Bollinger Bands Ribbon
    if (showBB && records.some((r) => r.bb_upper && r.bb_lower)) {
      ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.beginPath();
      records.forEach((r, idx) => {
        const x = getX(idx);
        const yUpper = getY(r.bb_upper || r.high);
        if (idx === 0) ctx.moveTo(x, yUpper);
        else ctx.lineTo(x, yUpper);
      });
      for (let idx = records.length - 1; idx >= 0; idx--) {
        const x = getX(idx);
        const yLower = getY(records[idx].bb_lower || records[idx].low);
        ctx.lineTo(x, yLower);
      }
      ctx.closePath();
      ctx.fill();

      // BB Upper / Lower lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      records.forEach((r, idx) => {
        const x = getX(idx);
        const y = getY(r.bb_upper || r.high);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.beginPath();
      records.forEach((r, idx) => {
        const x = getX(idx);
        const y = getY(r.bb_lower || r.low);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 2. Draw Candlesticks & Volume
    records.forEach((r, idx) => {
      const x = getX(idx);
      const isUp = r.close >= r.open;
      const color = isUp ? '#10b981' : '#ef4444';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, getY(r.high));
      ctx.lineTo(x, getY(r.low));
      ctx.stroke();

      // Body
      const yOpen = getY(r.open);
      const yClose = getY(r.close);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Volume bar
      const volHeight = (r.volume / maxVolume) * volumeChartHeight;
      const volY = volumeTop + (volumeChartHeight - volHeight);
      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)';
      ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volHeight);
    });

    // 3. Draw SMA 20 Overlay (Amber)
    if (showSMA && records.some((r) => r.sma_20)) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      records.forEach((r, idx) => {
        if (r.sma_20) {
          const x = getX(idx);
          const y = getY(r.sma_20);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // 4. Draw EMA 12 Overlay (Cyan)
    if (showEMA && records.some((r) => r.ema_12)) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      records.forEach((r, idx) => {
        if (r.ema_12) {
          const x = getX(idx);
          const y = getY(r.ema_12);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // 5. Draw Crosshair Hover Indicator
    if (hoverIndex !== null && records[hoverIndex]) {
      const hX = getX(hoverIndex);
      const rec = records[hoverIndex];
      const hY = getY(rec.close);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([4, 4]);
      // Vertical crosshair
      ctx.beginPath();
      ctx.moveTo(hX, padding.top);
      ctx.lineTo(hX, height - padding.bottom);
      ctx.stroke();

      // Horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(padding.left, hY);
      ctx.lineTo(width - padding.right, hY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [records, hoverIndex, showSMA, showEMA, showBB]);

  const activeRecord = hoverIndex !== null && records[hoverIndex] ? records[hoverIndex] : records[records.length - 1];

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || records.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 20; // 20 is padding left
    const chartWidth = canvas.clientWidth - 80;
    const idx = Math.floor((x / chartWidth) * records.length);
    if (idx >= 0 && idx < records.length) {
      setHoverIndex(idx);
    }
  };

  return (
    <div className="glass-card p-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono text-white">{symbol}</h2>
            {activeRecord && (
              <span className="text-2xl font-bold font-mono text-white">
                ${activeRecord.close.toFixed(2)}
              </span>
            )}
            {activeRecord && (
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  activeRecord.close >= activeRecord.open
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {(((activeRecord.close - activeRecord.open) / activeRecord.open) * 100).toFixed(2)}%
              </span>
            )}
          </div>
          {activeRecord && (
            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 mt-1.5">
              <span>Date: <strong className="text-slate-200">{activeRecord.date}</strong></span>
              <span>O: <strong className="text-slate-200">${activeRecord.open}</strong></span>
              <span>H: <strong className="text-slate-200">${activeRecord.high}</strong></span>
              <span>L: <strong className="text-slate-200">${activeRecord.low}</strong></span>
              <span>C: <strong className="text-slate-200">${activeRecord.close}</strong></span>
              <span>Vol: <strong className="text-slate-200">{activeRecord.volume.toLocaleString()}</strong></span>
            </div>
          )}
        </div>

        {/* Timeframe & Overlays */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Horizon filters */}
          <div className="flex items-center bg-[#090d16] p-1 rounded-lg border border-white/10 text-xs font-mono">
            {['1mo', '3mo', '6mo', '1y', '5y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded transition-all ${
                  period === p ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-1 rounded text-xs font-mono border transition-all ${
                showSMA
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-transparent text-slate-500 border-white/5'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-1 rounded text-xs font-mono border transition-all ${
                showEMA
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-transparent text-slate-500 border-white/5'
              }`}
            >
              EMA 12
            </button>
            <button
              onClick={() => setShowBB(!showBB)}
              className={`px-2 py-1 rounded text-xs font-mono border transition-all ${
                showBB
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-transparent text-slate-500 border-white/5'
              }`}
            >
              Bollinger
            </button>
          </div>
        </div>
      </div>

      {/* Candlestick Canvas */}
      <div className="relative w-full overflow-hidden" onMouseLeave={() => setHoverIndex(null)}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          className="cursor-crosshair w-full block"
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-mono">
        <span>Sub-panel: 20-Period Volume Profile</span>
        <span>Interactive Crosshairs • Zoom-ready Dynamic Projection</span>
      </div>
    </div>
  );
};
