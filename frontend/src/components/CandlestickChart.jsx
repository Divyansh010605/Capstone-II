import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, Activity, Calendar, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export const CandlestickChart = ({ historyData, symbol, period, setPeriod }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const rawRecords = historyData?.data || [];
  // Ensure valid records with numeric prices
  const records = rawRecords.filter(
    (r) => typeof r.close === 'number' && typeof r.open === 'number' && typeof r.high === 'number' && typeof r.low === 'number'
  );

  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || records.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(container.clientWidth, 320);
    const height = 460;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Layout configuration
    const padding = { top: 25, right: 65, bottom: 55, left: 15 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const priceChartHeight = chartHeight * 0.76;
    const volumeChartHeight = chartHeight * 0.18;
    const volumeTop = padding.top + priceChartHeight + 14;

    // Bounds calculation
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 1;

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      if (r.low < minPrice) minPrice = r.low;
      if (r.high > maxPrice) maxPrice = r.high;
      if (showBB && r.bb_lower && r.bb_lower < minPrice) minPrice = r.bb_lower;
      if (showBB && r.bb_upper && r.bb_upper > maxPrice) maxPrice = r.bb_upper;
      if (r.volume > maxVolume) maxVolume = r.volume;
    }

    if (minPrice === Infinity || maxPrice === -Infinity || minPrice === maxPrice) {
      minPrice = 100;
      maxPrice = 110;
    }

    // Add breathing room
    const pricePadding = (maxPrice - minPrice) * 0.05 || 1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    const getY = (val) => padding.top + (1 - (val - minPrice) / priceRange) * priceChartHeight;
    const getX = (idx) => padding.left + (idx + 0.5) * (chartWidth / records.length);
    const candleWidth = Math.max(2, Math.min(18, (chartWidth / records.length) * 0.72));

    // Horizontal Grid Lines & Price Labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';

    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (i / gridSteps) * priceRange;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.fillText(`$${p.toFixed(2)}`, width - padding.right + 8, y + 3.5);
    }

    // 1. Draw Bollinger Bands Ribbon
    if (showBB && records.some((r) => r.bb_upper && r.bb_lower)) {
      ctx.fillStyle = 'rgba(139, 92, 246, 0.07)';
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

      // Top & Bottom boundary dashed lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

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
      ctx.setLineDash([]);
    }

    // 2. Draw Candlesticks & Volume Bars
    records.forEach((r, idx) => {
      const x = getX(idx);
      const isUp = r.close >= r.open;
      const candleColor = isUp ? '#10b981' : '#f43f5e';

      // Wick
      ctx.strokeStyle = candleColor;
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

      ctx.fillStyle = candleColor;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Volume Bar
      const volHeight = (r.volume / maxVolume) * volumeChartHeight;
      const volY = volumeTop + (volumeChartHeight - volHeight);
      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)';
      ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volHeight);
    });

    // 3. Draw SMA 20 Overlay (Amber Gold)
    if (showSMA && records.some((r) => r.sma_20)) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.6;
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

    // 4. Draw EMA 12 Overlay (Electric Cyan)
    if (showEMA && records.some((r) => r.ema_12)) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.6;
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

    // 5. Draw Interactive Crosshairs & Date Markers
    if (hoverIndex !== null && records[hoverIndex]) {
      const hX = getX(hoverIndex);
      const rec = records[hoverIndex];
      const hY = getY(rec.close);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([4, 4]);

      // Vertical Line
      ctx.beginPath();
      ctx.moveTo(hX, padding.top);
      ctx.lineTo(hX, height - padding.bottom);
      ctx.stroke();

      // Horizontal Line
      ctx.beginPath();
      ctx.moveTo(padding.left, hY);
      ctx.lineTo(width - padding.right, hY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pinned Y-Axis Price Tag
      ctx.fillStyle = rec.close >= rec.open ? '#10b981' : '#f43f5e';
      ctx.fillRect(width - padding.right, hY - 10, padding.right - 4, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`$${rec.close.toFixed(2)}`, width - padding.right + 6, hY + 3.5);

      // X-Axis Date Tag
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(hX - 35, height - padding.bottom + 6, 70, 18);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeRect(hX - 35, height - padding.bottom + 6, 70, 18);
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(rec.date.slice(5), hX, height - padding.bottom + 19);
    } else {
      // Date stamps on X-axis (every few bars)
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      const step = Math.max(1, Math.floor(records.length / 6));
      for (let i = 0; i < records.length; i += step) {
        ctx.fillText(records[i].date.slice(5), getX(i), height - padding.bottom + 16);
      }
    }
  }, [records, hoverIndex, showSMA, showEMA, showBB]);

  useEffect(() => {
    renderChart();
    const handleResize = () => renderChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderChart]);

  const activeRecord = hoverIndex !== null && records[hoverIndex] ? records[hoverIndex] : records[records.length - 1];

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || records.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 15;
    const chartWidth = canvas.clientWidth - 80;
    const idx = Math.floor((x / chartWidth) * records.length);
    if (idx >= 0 && idx < records.length) {
      setHoverIndex(idx);
    }
  };

  const pctChange = activeRecord && activeRecord.open
    ? (((activeRecord.close - activeRecord.open) / activeRecord.open) * 100).toFixed(2)
    : '0.00';
  const isUp = activeRecord ? activeRecord.close >= activeRecord.open : true;

  return (
    <div className="glass-card p-5 sm:p-6 space-y-4">
      {/* Chart Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black font-mono tracking-tight text-white">{symbol}</h2>
            {activeRecord && (
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                ${activeRecord.close?.toFixed(2)}
              </span>
            )}
            {activeRecord && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                  isUp
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {pctChange > 0 ? `+${pctChange}%` : `${pctChange}%`}
              </span>
            )}
          </div>

          {activeRecord && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-400 pt-1">
              <span>Date: <strong className="text-slate-200">{activeRecord.date}</strong></span>
              <span>Open: <strong className="text-slate-200">${activeRecord.open?.toFixed(2)}</strong></span>
              <span>High: <strong className="text-emerald-400">${activeRecord.high?.toFixed(2)}</strong></span>
              <span>Low: <strong className="text-rose-400">${activeRecord.low?.toFixed(2)}</strong></span>
              <span>Close: <strong className="text-slate-200">${activeRecord.close?.toFixed(2)}</strong></span>
              <span>Vol: <strong className="text-slate-300">{activeRecord.volume?.toLocaleString()}</strong></span>
            </div>
          )}
        </div>

        {/* Timeframe & Overlays */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#090d16] p-1 rounded-xl border border-white/10 text-xs font-mono shadow-inner">
            {['1mo', '3mo', '6mo', '1y', '5y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                  period === p
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all flex items-center gap-1.5 ${
                showSMA
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              SMA 20
            </button>

            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all flex items-center gap-1.5 ${
                showEMA
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              EMA 12
            </button>

            <button
              onClick={() => setShowBB(!showBB)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all flex items-center gap-1.5 ${
                showBB
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Bollinger
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-[#070a10] rounded-xl border border-white/5 p-2 shadow-inner"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {records.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 font-mono text-sm gap-2">
            <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
            <span>Loading high-resolution OHLCV candlesticks...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className="cursor-crosshair w-full block"
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono pt-1">
        <span className="flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          Volume Profile Sub-Chart • Moving Average Convergence Indicators
        </span>
        <span className="text-slate-500">
          Hover to inspect OHLC candles • Calibrated to 252 trading days/year
        </span>
      </div>
    </div>
  );
};
