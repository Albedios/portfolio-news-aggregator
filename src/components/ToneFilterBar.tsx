'use client';

import React, { useState } from 'react';
import { FilterOptions, ToneLabel, FeedCategory } from '@/lib/types';
import { TONE_COLORS } from '@/lib/constants';
import { SlidersHorizontal, ShieldAlert, Sparkles, X, Layers } from 'lucide-react';

interface ToneFilterBarProps {
  filter: FilterOptions;
  onChange: (updated: Partial<FilterOptions>) => void;
  onReset: () => void;
}

const CATEGORIES: FeedCategory[] = ['All', 'Tech', 'World', 'Science', 'Business', 'AI'];
const TONES: (ToneLabel | 'All')[] = ['All', 'Analytical', 'Optimistic', 'Critical', 'Alarmist', 'Neutral', 'Sensationalist'];

export function ToneFilterBar({ filter, onChange, onReset }: ToneFilterBarProps) {
  const activeTone = filter.tone || 'All';
  const activeCategory = filter.category || 'All';
  const [synthesisMode, setSynthesisMode] = useState<'balanced' | 'fast' | 'deep'>('balanced');

  const isFiltered =
    Boolean(filter.search) ||
    activeCategory !== 'All' ||
    activeTone !== 'All' ||
    filter.onlyAnalyzed ||
    filter.onlyBookmarked ||
    (filter.maxClickbait !== undefined && filter.maxClickbait < 5);

  return (
    <div className="flex flex-col gap-3.5 mb-6">
      {/* 1. Synthesis Mode & Primary Controls Bar (Stitch Segmented Control) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low p-2 rounded-xl border border-outline-variant shadow-sm">
        {/* Synthesis Mode Pills */}
        <div className="flex gap-1 bg-surface rounded-lg p-1 border border-outline-variant/50 shadow-sm">
          {(['balanced', 'fast', 'deep'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSynthesisMode(mode)}
              className={`px-3.5 py-1.5 rounded-md font-label-sm font-bold text-xs capitalize transition-all ${
                synthesisMode === mode
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 text-xs font-label-sm">
          {/* AI Summarized Only */}
          <button
            onClick={() => onChange({ onlyAnalyzed: !filter.onlyAnalyzed, page: 1 })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold transition ${
              filter.onlyAnalyzed
                ? 'bg-primary-container/10 text-primary border-primary/40'
                : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Summarized Only</span>
          </button>

          {/* Clickbait Shield */}
          <button
            onClick={() =>
              onChange({
                maxClickbait: filter.maxClickbait === 2 ? 5 : 2,
                page: 1,
              })
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold transition ${
              filter.maxClickbait === 2
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'
            }`}
            title="Filter out articles with sensationalized headlines"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Clickbait Shield</span>
          </button>

          {isFiltered && (
            <button
              onClick={onReset}
              className="text-xs font-bold text-error hover:opacity-80 underline underline-offset-4 flex items-center gap-1 pl-1 transition"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-label-sm">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === (cat === 'All' ? 'All' : cat);
          return (
            <button
              key={cat}
              onClick={() => onChange({ category: cat === 'All' ? undefined : cat, page: 1 })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. News Tone Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-label-sm">
        <span className="text-xs font-bold text-on-surface-variant mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          <span>Tone:</span>
        </span>
        {TONES.map((tone) => {
          const isSelected = activeTone === tone;
          const style = tone === 'All' ? null : TONE_COLORS[tone];

          return (
            <button
              key={tone}
              onClick={() => onChange({ tone: tone === 'All' ? undefined : tone, page: 1 })}
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                isSelected
                  ? tone === 'All'
                    ? 'bg-on-surface text-surface font-extrabold shadow-sm'
                    : `${style?.badge} ring-2 ring-primary/30 font-bold shadow-sm`
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant'
              }`}
            >
              {style && <span className="text-xs">{style.icon}</span>}
              <span>{tone}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}