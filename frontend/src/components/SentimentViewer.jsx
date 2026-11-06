import React from 'react';
import {
  Newspaper,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  TrendingUp,
  Activity,
  Clock,
} from 'lucide-react';

export const SentimentViewer = ({ sentimentData, symbol }) => {
  if (!sentimentData) {
    return (
      <div className="glass-card p-12 text-center text-slate-400 font-mono text-sm flex flex-col items-center justify-center gap-3">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
        <span>Scraping & analyzing financial news sentiment for {symbol}...</span>
      </div>
    );
  }

  const overall = sentimentData.overall_sentiment || 'Neutral';
  const index100 = Math.round(sentimentData.sentiment_index_100 || 50);
  const breakdown = sentimentData.breakdown || { positive_pct: 33, neutral_pct: 34, negative_pct: 33 };
  const articles = sentimentData.articles || [];

  const sentimentColor =
    overall === 'Positive'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/15'
      : overall === 'Negative'
      ? 'text-rose-400 border-rose-500/30 bg-rose-500/15'
      : 'text-amber-400 border-amber-500/30 bg-amber-500/15';

  return (
    <div className="space-y-6">
      {/* Top Sentiment Summary Card */}
      <div className="glass-card p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Financial News Sentiment NLP Engine
                </h3>
                <span className={`text-xs px-3 py-0.5 rounded-full border font-mono font-bold tracking-wide ${sentimentColor}`}>
                  {overall}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Domain-Augmented Financial Lexicon & Multi-Stream NLP News Analyzer for {symbol}
              </p>
            </div>
          </div>

          {/* Sentiment Index Meter */}
          <div className="flex items-center gap-4 bg-[#090d16] px-4 py-2.5 rounded-xl border border-white/10 shadow-inner self-stretch md:self-auto justify-between md:justify-start">
            <div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Sentiment Index</div>
              <div className="text-xl font-black font-mono text-white">{index100} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
            </div>
            <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  index100 >= 60
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    : index100 <= 40
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-cyan-400 to-amber-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, index100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 flex items-center gap-3.5 shadow-inner">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Bullish / Positive Coverage</div>
              <div className="text-2xl font-black font-mono text-emerald-400">{breakdown.positive_pct}%</div>
            </div>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 flex items-center gap-3.5 shadow-inner">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Minus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Neutral / Balanced News</div>
              <div className="text-2xl font-black font-mono text-amber-400">{breakdown.neutral_pct}%</div>
            </div>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 flex items-center gap-3.5 shadow-inner">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ThumbsDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Bearish / Negative Signals</div>
              <div className="text-2xl font-black font-mono text-rose-400">{breakdown.negative_pct}%</div>
            </div>
          </div>
        </div>

        {/* NLP Synthesis Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 text-xs text-slate-300">
          <strong className="text-indigo-300 font-mono uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            NLP Financial News Synthesis
          </strong>
          {sentimentData.sentiment_summary}
        </div>
      </div>

      {/* Real-time Article Stream */}
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Aggregated Market News Feed
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            {articles.length} Analyzed Articles
          </span>
        </div>

        <div className="space-y-3">
          {articles.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              No recent news articles scraped for {symbol}.
            </div>
          ) : (
            articles.map((art, idx) => {
              const isPos = art.sentiment === 'Positive';
              const isNeg = art.sentiment === 'Negative';
              const badgeStyle = isPos
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : isNeg
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#090d16] border border-white/5 hover:border-white/15 transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span className="font-bold text-slate-200">{art.publisher}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {art.published_at}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold self-start sm:self-auto ${badgeStyle}`}>
                      {art.sentiment} ({art.score > 0 ? `+${art.score}` : art.score})
                    </span>
                  </div>

                  <h5 className="text-sm font-semibold text-white leading-snug hover:text-cyan-400 transition-colors">
                    {art.title}
                  </h5>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      NLP Confidence: {Math.round((art.confidence || 0.85) * 100)}%
                    </span>
                    {art.url && (
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1"
                      >
                        <span>Read Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
