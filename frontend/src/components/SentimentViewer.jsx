import React from 'react';
import { Newspaper, ExternalLink, ThumbsUp, ThumbsDown, Minus, TrendingUp } from 'lucide-react';

export const SentimentViewer = ({ sentimentData, symbol }) => {
  if (!sentimentData) {
    return (
      <div className="glass-card p-8 text-center text-slate-400 font-mono text-sm">
        Loading financial market sentiment for {symbol}...
      </div>
    );
  }

  const overall = sentimentData.overall_sentiment || 'Neutral';
  const score = sentimentData.sentiment_score || 0;
  const index100 = sentimentData.sentiment_index_100 || 50;
  const breakdown = sentimentData.breakdown || { positive_pct: 33, neutral_pct: 34, negative_pct: 33 };
  const articles = sentimentData.articles || [];

  const sentimentColor =
    overall === 'Positive'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : overall === 'Negative'
      ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
      : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

  return (
    <div className="space-y-6">
      {/* Top Sentiment Summary Card */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Financial News Sentiment NLP Engine
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold ${sentimentColor}`}>
                  {overall}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Lexicon & Contextual Financial Sentiment Extraction on {symbol} News Streams
              </p>
            </div>
          </div>

          {/* Sentiment Index Meter */}
          <div className="flex items-center gap-3 bg-[#090d16] px-4 py-2 rounded-xl border border-white/10">
            <div>
              <div className="text-[11px] text-slate-400 font-mono">SENTIMENT INDEX</div>
              <div className="text-lg font-bold font-mono text-white">{index100} / 100</div>
            </div>
            <div className="w-16 bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  index100 >= 60 ? 'bg-emerald-500' : index100 <= 40 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${index100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Bullish / Positive</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{breakdown.positive_pct}%</div>
            </div>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Minus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Neutral / Balanced</div>
              <div className="text-xl font-bold font-mono text-amber-400">{breakdown.neutral_pct}%</div>
            </div>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ThumbsDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Bearish / Negative</div>
              <div className="text-xl font-bold font-mono text-rose-400">{breakdown.negative_pct}%</div>
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-300">
          <strong className="text-white">NLP Synthesis: </strong>
          {sentimentData.sentiment_summary}
        </div>
      </div>

      {/* Real-time Headline Feed */}
      <div className="glass-card p-5">
        <h4 className="text-sm font-bold text-white font-mono mb-4 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-blue-400" />
          Recent Financial News Headlines & Sentiment Attribution
        </h4>

        <div className="space-y-3">
          {articles.map((item, idx) => {
            const isPos = item.sentiment === 'Positive';
            const isNeg = item.sentiment === 'Negative';
            const badgeClass = isPos
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              : isNeg
              ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#090d16] border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-slate-200 hover:text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    {item.title}
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>{item.publisher}</span>
                    <span>•</span>
                    <span>{item.published_at}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-mono font-bold ${badgeClass}`}>
                    {item.sentiment}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {item.score > 0 ? `+${item.score}` : item.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
