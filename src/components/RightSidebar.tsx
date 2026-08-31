'use client';

import React from 'react';
import { Article, AggregatorStats } from '@/lib/types';
import { TONE_COLORS } from '@/lib/constants';
import { Zap, TrendingUp, Compass, Sparkles, Flame, Layers } from 'lucide-react';

interface RightSidebarProps {
  stats: AggregatorStats | null;
  trendingArticles: Article[];
  onSelectArticle: (article: Article) => void;
}

export function RightSidebar({ stats, trendingArticles, onSelectArticle }: RightSidebarProps) {
  // Extract key quick insights from analyzed articles
  const quickInsights = trendingArticles
    .filter((a) => a.analysis && a.analysis.tldr)
    .slice(0, 3)
    .map((a, idx) => ({
      category: a.analysis?.category || 'General',
      text: a.analysis?.tldr || a.title,
      article: a,
      color: ['bg-primary', 'bg-amber-400', 'bg-indigo-400'][idx % 3],
    }));

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-80 shrink-0 sticky top-20 animate-fade-in">
      {/* 1. Quick AI Insights (Stitch Quick AI Insights) */}
      <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-primary">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface">
            Quick AI Insights
          </h3>
        </div>

        {quickInsights.length === 0 ? (
          <p className="text-xs text-on-surface-variant font-body-md">
            Ingest and summarize news to view automated market and technology intelligence.
          </p>
        ) : (
          <ul className="flex flex-col gap-3 font-body-md">
            {quickInsights.map((item, idx) => (
              <li
                key={idx}
                onClick={() => onSelectArticle(item.article)}
                className="flex items-start gap-2.5 pb-3 border-b border-outline-variant/60 last:border-0 last:pb-0 cursor-pointer group"
              >
                <span className={`w-2 h-2 rounded-full ${item.color} mt-1.5 shrink-0 group-hover:scale-125 transition`}></span>
                <p className="text-xs text-on-surface-variant leading-snug group-hover:text-primary transition line-clamp-3">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. Trending Summaries (Stitch Trending Summaries) */}
      <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-on-surface">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface">
            Trending Summaries
          </h3>
        </div>

        <div className="flex flex-col gap-3.5">
          {trendingArticles.slice(0, 4).map((art, idx) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="group cursor-pointer pb-3 border-b border-outline-variant/60 last:border-0 last:pb-0"
            >
              <span className="text-[10px] font-label-xs font-bold text-primary mb-1 block uppercase tracking-wider">
                {idx + 1}. {art.analysis?.category || art.feedTitle}
              </span>
              <h4 className="font-headline-md text-sm font-bold text-on-surface group-hover:text-primary transition leading-snug line-clamp-2">
                {art.title}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tone Spectrum */}
      {stats && stats.totalArticles > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-secondary">
            <Compass className="w-4 h-4" />
            <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface">
              Tone Spectrum
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-label-sm font-semibold text-on-surface">
            {Object.entries(stats.toneDistribution).map(([tone, count]) => {
              const style = TONE_COLORS[tone];
              return (
                <div key={tone} className="p-2 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>{style?.icon || '⚪'}</span>
                    <span className="text-xs">{tone}</span>
                  </span>
                  <span className="font-bold text-primary">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}