'use client';

import React from 'react';
import { AggregatorStats, ToneLabel } from '@/lib/types';
import { TONE_COLORS } from '@/lib/constants';
import { Sparkles, TrendingUp, Layers, Compass } from 'lucide-react';

interface StatsOverviewProps {
  stats: AggregatorStats | null;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) return null;

  const sentimentPercent = Math.round(((stats.averageSentiment + 1) / 2) * 100);
  const sentimentColor =
    stats.averageSentiment > 0.15
      ? 'text-emerald-400'
      : stats.averageSentiment < -0.15
      ? 'text-rose-400'
      : 'text-cyan-400';

  const sentimentLabel =
    stats.averageSentiment > 0.25
      ? 'Optimistic / Breakthrough'
      : stats.averageSentiment > 0.05
      ? 'Mildly Constructive'
      : stats.averageSentiment < -0.25
      ? 'Critical / High Tension'
      : stats.averageSentiment < -0.05
      ? 'Mildly Cautious'
      : 'Balanced Neutral';

  const dominantStyle = TONE_COLORS[stats.dominantTone] || TONE_COLORS.Neutral;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      {/* 1. Ingestion Volume */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group hover:border-indigo-500/40">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
          <span>Feed Ingestion</span>
          <Layers className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stats.totalArticles}
          </span>
          <span className="text-xs text-slate-400 font-medium">articles</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{stats.activeFeeds} active RSS sources</span>
        </div>
      </div>

      {/* 2. AI Analyzed Ratio */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group hover:border-cyan-500/40">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
          <span>AI Analyzed</span>
          <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stats.analyzedArticles}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            / {stats.totalArticles} ({stats.totalArticles > 0 ? Math.round((stats.analyzedArticles / stats.totalArticles) * 100) : 0}%)
          </span>
        </div>
        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-1.5 rounded-full transition-all duration-700"
            style={{
              width: `${stats.totalArticles > 0 ? (stats.analyzedArticles / stats.totalArticles) * 100 : 0}%`,
            }}
          ></div>
        </div>
      </div>

      {/* 3. Global News Pulse Sentiment */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group hover:border-emerald-500/40">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
          <span>Pulse Sentiment</span>
          <TrendingUp className={`w-4 h-4 ${sentimentColor} group-hover:scale-110 transition`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl sm:text-3xl font-extrabold ${sentimentColor} tracking-tight`}>
            {stats.averageSentiment > 0 ? `+${stats.averageSentiment}` : stats.averageSentiment}
          </span>
          <span className="text-[11px] font-semibold text-slate-300 truncate">{sentimentLabel}</span>
        </div>
        {/* Sentiment Spectrum Indicator */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 relative">
          <div
            className="absolute top-0 bottom-0 w-2 h-2.5 -top-0.5 bg-white rounded-full shadow-md shadow-cyan-400 transition-all duration-500"
            style={{ left: `calc(${sentimentPercent}% - 4px)` }}
          ></div>
        </div>
      </div>

      {/* 4. Dominant Editorial Tone */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden group hover:border-purple-500/40">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
          <span>Dominant Tone</span>
          <Compass className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
        </div>
        <div className="flex items-center space-x-2 mt-0.5">
          <span className="text-xl">{dominantStyle.icon}</span>
          <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
            {stats.dominantTone}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
          <span>
            {stats.toneDistribution[stats.dominantTone as ToneLabel] || 0} stories classified
          </span>
        </div>
      </div>
    </div>
  );
}