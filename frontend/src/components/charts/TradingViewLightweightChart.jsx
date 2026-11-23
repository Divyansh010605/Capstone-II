import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';

export const TradingViewLightweightChart = ({
  data = [],
  symbol = 'AAPL',
  height = 440,
  indicators = { sma20: true, sma50: false, ema12: false, bb: true },
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [legend, setLegend] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up prior chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth || 800,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#101310' },
        textColor: '#969B91',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#202720', style: 1 },
        horzLines: { color: '#202720', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#475245',
          width: 1,
          style: 2,
          labelBackgroundColor: '#191E19',
        },
        horzLine: {
          color: '#475245',
          width: 1,
          style: 2,
          labelBackgroundColor: '#191E19',
        },
      },
      rightPriceScale: {
        borderColor: '#343B33',
        scaleMargins: { top: 0.1, bottom: 0.22 },
      },
      timeScale: {
        borderColor: '#343B33',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#77C98B',
      downColor: '#E47770',
      borderUpColor: '#77C98B',
      borderDownColor: '#E47770',
      wickUpColor: '#77C98B',
      wickDownColor: '#E47770',
    });

    // 2. Volume Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#343B33',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    // Format & validate data
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const candleData = [];
    const volData = [];
    const sma20Data = [];
    const sma50Data = [];
    const bbUpperData = [];
    const bbLowerData = [];

    sortedData.forEach((d) => {
      if (!d.date) return;
      const time = d.date.split('T')[0];
      const open = typeof d.open === 'number' ? d.open : Number(d.open);
      const high = typeof d.high === 'number' ? d.high : Number(d.high);
      const low = typeof d.low === 'number' ? d.low : Number(d.low);
      const close = typeof d.close === 'number' ? d.close : Number(d.close);
      const volume = typeof d.volume === 'number' ? d.volume : Number(d.volume) || 0;

      if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
        candleData.push({ time, open, high, low, close });
        volData.push({
          time,
          value: volume,
          color: close >= open ? 'rgba(119, 201, 139, 0.28)' : 'rgba(228, 119, 112, 0.28)',
        });

        if (d.sma_20) sma20Data.push({ time, value: d.sma_20 });
        if (d.sma_50) sma50Data.push({ time, value: d.sma_50 });
        if (d.bb_upper) bbUpperData.push({ time, value: d.bb_upper });
        if (d.bb_lower) bbLowerData.push({ time, value: d.bb_lower });
      }
    });

    candleSeries.setData(candleData);
    volumeSeries.setData(volData);

    // Indicator Line Series
    if (indicators.sma20 && sma20Data.length > 0) {
      const smaLine = chart.addLineSeries({
        color: '#C7F36B',
        lineWidth: 1,
        title: 'SMA 20',
        priceLineVisible: false,
      });
      smaLine.setData(sma20Data);
    }

    if (indicators.sma50 && sma50Data.length > 0) {
      const sma50Line = chart.addLineSeries({
        color: '#38BDF8',
        lineWidth: 1,
        title: 'SMA 50',
        priceLineVisible: false,
      });
      sma50Line.setData(sma50Data);
    }

    if (indicators.bb && bbUpperData.length > 0) {
      const bbUp = chart.addLineSeries({
        color: 'rgba(199, 243, 107, 0.4)',
        lineWidth: 1,
        lineStyle: 2,
        title: 'BB Up',
        priceLineVisible: false,
      });
      const bbLow = chart.addLineSeries({
        color: 'rgba(199, 243, 107, 0.4)',
        lineWidth: 1,
        lineStyle: 2,
        title: 'BB Low',
        priceLineVisible: false,
      });
      bbUp.setData(bbUpperData);
      bbLow.setData(bbLowerData);
    }

    // Set initial legend
    if (candleData.length > 0) {
      const last = candleData[candleData.length - 1];
      setLegend({
        date: last.time,
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
        volume: volData[volData.length - 1]?.value || 0,
      });
    }

    // Crosshair hover listener
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > height
      ) {
        if (candleData.length > 0) {
          const last = candleData[candleData.length - 1];
          setLegend({
            date: last.time,
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            volume: volData[volData.length - 1]?.value || 0,
          });
        }
        return;
      }

      const bar = param.seriesData.get(candleSeries);
      const volBar = param.seriesData.get(volumeSeries);
      if (bar) {
        setLegend({
          date: param.time,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: volBar ? volBar.value : 0,
        });
      }
    });

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !entries[0].contentRect) return;
      const { width: newWidth } = entries[0].contentRect;
      chart.applyOptions({ width: newWidth });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, height, indicators]);

  const isUp = legend ? legend.close >= legend.open : true;

  return (
    <div className="relative w-full bg-[#101310] border border-[#343B33] overflow-hidden">
      {/* Real-time Technical HUD Legend */}
      <div className="absolute top-2 left-3 z-10 flex flex-wrap items-center gap-3 text-[11px] font-mono pointer-events-none select-none bg-[#141814]/90 px-2.5 py-1 border border-[#343B33]">
        <span className="font-heading font-bold text-xs text-[#E9E8DF]">{symbol}</span>
        {legend && (
          <>
            <span className="text-[#969B91]">O: <strong className="text-[#E9E8DF]">{legend.open?.toFixed(2)}</strong></span>
            <span className="text-[#969B91]">H: <strong className="text-[#77C98B]">{legend.high?.toFixed(2)}</strong></span>
            <span className="text-[#969B91]">L: <strong className="text-[#E47770]">{legend.low?.toFixed(2)}</strong></span>
            <span className="text-[#969B91]">C: <strong className={isUp ? 'text-[#77C98B]' : 'text-[#E47770]'}>{legend.close?.toFixed(2)}</strong></span>
            {legend.volume > 0 && (
              <span className="text-[#969B91]">VOL: <strong className="text-[#E9E8DF]">{legend.volume.toLocaleString()}</strong></span>
            )}
          </>
        )}
      </div>

      {/* Chart Canvas Container */}
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
};
