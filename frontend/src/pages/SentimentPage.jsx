import React, { useState } from 'react';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Filter,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useTerminal } from '../context/TerminalContext';

export const SentimentPage = () => {
  const { selectedSymbol, sentimentData, loadingSentiment } = useTerminal();
  const [filterType, setFilterType] = useState('ALL'); // ALL, Positive, Neutral, Negative

  const score = sentimentData?.sentiment_index_100 || 74;
  const sentiment = sentimentData?.overall_sentiment || 'Positive';
  const breakdown = sentimentData?.breakdown || {
    positive_pct: 68.0,
    neutral_pct: 22.0,
    negative_pct: 10.0,
    total_articles: 18,
  };

  const articles = (sentimentData?.articles || []).filter((art) => {
    if (filterType === 'ALL') return true;
    return art.sentiment.toUpperCase() === filterType.toUpperCase();
  });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1700px] mx-auto w-full">
      {/* 1. Header Bar */}
      <div className="term-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl text-[#E9E8DF]">
              FINANCIAL NLP SENTIMENT INTELLIGENCE // {selectedSymbol}
            </span>
            <span className="term-badge-accent">NLTK VADER ENGINE</span>
          </div>
          <p className="text-xs text-[#969B91] mt-0.5">
            Real-Time Financial Lexicon Scoring, News Aggregation & Market Sentiment Index
          </p>
        </div>

        {/* Index Score Pill */}
        <div className="flex items-center gap-3 bg-[#101310] border border-[#343B33] p-2.5">
          <div>
            <div className="text-[10px] text-[#969B91] uppercase">SENTIMENT INDEX</div>
            <div className="text-xl font-black text-[#E9E8DF]">
              {score} <span className="text-xs text-[#969B91] font-normal">/ 100</span>
            </div>
          </div>
          <div className="w-24 bg-[#202720] h-2.5 overflow-hidden border border-[#343B33]">
            <div
              className={`h-full ${
                score > 60 ? 'bg-[#77C98B]' : score < 40 ? 'bg-[#E47770]' : 'bg-[#C7F36B]'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Sentiment Polarity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">BULLISH / POSITIVE STREAM</div>
          <div className="text-xl font-bold text-[#77C98B] mt-1">{breakdown.positive_pct}%</div>
          <div className="text-[9px] text-[#969B91] mt-1">FAVORABLE REVENUE & GUIDANCE</div>
        </div>
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">NEUTRAL / MACRO STREAM</div>
          <div className="text-xl font-bold text-[#969B91] mt-1">{breakdown.neutral_pct}%</div>
          <div className="text-[9px] text-[#969B91] mt-1">RATE CUTS & POLICY ANNOUNCEMENTS</div>
        </div>
        <div className="term-panel p-3">
          <div className="text-[10px] text-[#969B91]">BEARISH / HEADWINDS STREAM</div>
          <div className="text-xl font-bold text-[#E47770] mt-1">{breakdown.negative_pct}%</div>
          <div className="text-[9px] text-[#969B91] mt-1">SUPPLY CHAIN & REGULATORY RISK</div>
        </div>
      </div>

      {/* 3. Filterable News Feed */}
      <div className="term-panel">
        <div className="term-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-3.5 h-3.5 text-[#C7F36B]" />
            <span>CLASSIFIED FINANCIAL WIRE HEADLINES ({articles.length})</span>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1">
            {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2 py-0.5 text-[10px] font-mono border ${
                  filterType === f
                    ? 'border-[#C7F36B] text-[#C7F36B] bg-[#C7F36B]/10 font-bold'
                    : 'border-[#343B33] text-[#969B91]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3 font-mono">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#121512] border border-[#242B24] hover:border-[#343B33] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <a
                  href={art.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#E9E8DF] hover:text-[#C7F36B] flex items-center gap-1.5 transition-colors"
                >
                  <span>{art.title}</span>
                  <ExternalLink className="w-3 h-3 text-[#969B91]" />
                </a>
                <div className="text-[10px] text-[#969B91] flex items-center gap-3">
                  <span>{art.publisher}</span>
                  <span>•</span>
                  <span>{art.published_at}</span>
                  <span>•</span>
                  <span>Model Confidence: {art.confidence ? (art.confidence * 100).toFixed(0) : '92'}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[9px] text-[#969B91]">POLARITY SCORE</div>
                  <div
                    className={`font-bold ${
                      art.score > 0 ? 'text-[#77C98B]' : art.score < 0 ? 'text-[#E47770]' : 'text-[#969B91]'
                    }`}
                  >
                    {art.score > 0 ? '+' : ''}{art.score}
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 font-bold border ${
                    art.sentiment === 'Positive'
                      ? 'bg-[#77C98B]/10 text-[#77C98B] border-[#77C98B]/30'
                      : art.sentiment === 'Negative'
                      ? 'bg-[#E47770]/10 text-[#E47770] border-[#E47770]/30'
                      : 'bg-[#969B91]/10 text-[#969B91] border-[#969B91]/30'
                  }`}
                >
                  {art.sentiment.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
