import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MarketTickerTape } from './MarketTickerTape';

export const TerminalLayout = () => {
  return (
    <div className="min-h-screen bg-[#101310] text-[#E9E8DF] flex flex-col font-sans">
      {/* 1. Global Market Indices Tape */}
      <MarketTickerTape />

      {/* 2. Compact Top Bar */}
      <TopBar />

      {/* 3. Main Body with Persistent Sidebar & Outlet */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-[#101310] flex flex-col min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
