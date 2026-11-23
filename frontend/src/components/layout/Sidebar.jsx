import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CandlestickChart,
  Bookmark,
  Cpu,
  LineChart,
  ShieldAlert,
  Briefcase,
  Newspaper,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Terminal as TerminalIcon,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard, keyHint: '1' },
  { path: '/explorer', label: 'Stock Explorer', icon: CandlestickChart, keyHint: '2' },
  { path: '/watchlist', label: 'Watchlist', icon: Bookmark, keyHint: '3' },
  { path: '/predictions', label: 'AI Predictions', icon: Cpu, keyHint: '4' },
  { path: '/models', label: 'Model Performance', icon: LineChart, keyHint: '5' },
  { path: '/risk', label: 'Risk Analytics', icon: ShieldAlert, keyHint: '6' },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase, keyHint: '7' },
  { path: '/sentiment', label: 'News & Sentiment', icon: Newspaper, keyHint: '8' },
  { path: '/settings', label: 'Settings', icon: Settings, keyHint: '9' },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[#141814] border-r border-[#343B33] flex flex-col justify-between transition-all duration-200 select-none z-30 shrink-0 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Top Nav Section */}
      <div className="flex flex-col py-2">
        {/* Terminal Header Info */}
        {!collapsed && (
          <div className="px-3.5 py-1.5 mb-2 text-[10px] font-mono uppercase tracking-widest text-[#969B91] border-b border-[#242B24] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#C7F36B]">
              <TerminalIcon className="w-3 h-3" />
              TERMINAL WORKSPACES
            </span>
            <span className="text-[9px] text-[#969B91]">F1-F9</span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col gap-0.5 px-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono transition-colors rounded-none border-l-2 ${
                    isActive
                      ? 'bg-[#1F261F] text-[#E9E8DF] border-[#C7F36B] font-semibold'
                      : 'border-transparent text-[#969B91] hover:text-[#E9E8DF] hover:bg-[#191E19]'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-[#C7F36B]" />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 overflow-hidden">
                    <span className="truncate font-sans font-medium text-xs">{item.label}</span>
                    <span className="text-[10px] font-mono text-[#5d6459]">{item.keyHint}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="p-2 border-t border-[#343B33] flex flex-col gap-2">
        {!collapsed && (
          <div className="p-2 bg-[#101310] border border-[#242B24] text-[10px] font-mono text-[#969B91]">
            <div className="flex items-center justify-between text-[#E9E8DF] font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-[#C7F36B]" />
                PYTORCH RUNTIME
              </span>
              <span className="text-[#77C98B]">CUDA/MPS</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span>MODELS: 4 LOADED</span>
              <span>INFERENCE: ~42ms</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 text-[#969B91] hover:text-[#E9E8DF] hover:bg-[#191E19] border border-transparent hover:border-[#343B33] text-xs font-mono transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="ml-1 text-[11px]">COLLAPSE PANEL</span>}
        </button>
      </div>
    </aside>
  );
};
