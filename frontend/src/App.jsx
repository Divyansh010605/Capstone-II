import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { TerminalProvider } from './context/TerminalContext';
import { TerminalLayout } from './components/layout/TerminalLayout';

// Application Pages
import { OverviewPage } from './pages/OverviewPage';
import { StockExplorerPage } from './pages/StockExplorerPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { RiskAnalyticsPage } from './pages/RiskAnalyticsPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { SentimentPage } from './pages/SentimentPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

// Global Keyboard Navigation Listener
const KeyboardShortcutsHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger when typing in inputs/textareas
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      switch (e.key) {
        case '1':
          navigate('/overview');
          break;
        case '2':
          navigate('/explorer');
          break;
        case '3':
          navigate('/watchlist');
          break;
        case '4':
          navigate('/predictions');
          break;
        case '5':
          navigate('/models');
          break;
        case '6':
          navigate('/risk');
          break;
        case '7':
          navigate('/portfolio');
          break;
        case '8':
          navigate('/sentiment');
          break;
        case '9':
          navigate('/settings');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
};

export function App() {
  return (
    <BrowserRouter>
      <TerminalProvider>
        <KeyboardShortcutsHandler />
        <Routes>
          {/* Full-Page Auth Gateway */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Persistent Terminal Layout & Workspaces */}
          <Route path="/" element={<TerminalLayout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="explorer" element={<StockExplorerPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="models" element={<ModelPerformancePage />} />
            <Route path="risk" element={<RiskAnalyticsPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="sentiment" element={<SentimentPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </TerminalProvider>
    </BrowserRouter>
  );
}

export default App;
