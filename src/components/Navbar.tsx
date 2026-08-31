'use client';

import React from 'react';
import { Search, Sparkles, RefreshCw, Bookmark, Menu, X, CheckCircle2, ShieldCheck, Radio } from 'lucide-react';
import { AppSettings } from '@/lib/types';
import { BrieflyLogo } from '@/components/BrieflyLogo';

interface NavbarProps {
  settings: AppSettings | null;
  isSyncing: boolean;
  isBatchAnalyzing: boolean;
  searchQuery: string;
  activeFilterPreset?: 'latest' | 'trending' | 'verified';
  onSelectFilterPreset?: (preset: 'latest' | 'trending' | 'verified') => void;
  onSearchChange: (q: string) => void;
  onSyncFeeds: () => void;
  onBatchAnalyze: () => void;
  onOpenStudio: () => void;
}

export function Navbar({
  settings,
  isSyncing,
  isBatchAnalyzing,
  searchQuery,
  activeFilterPreset = 'latest',
  onSelectFilterPreset,
  onSearchChange,
  onSyncFeeds,
  onBatchAnalyze,
  onOpenStudio,
}: NavbarProps) {
  const providerLabel = {
    nim: 'NVIDIA NIM',
    gemini: 'Gemini 2.0 Flash',
    openai: 'GPT-4o-mini',
    ollama: 'Local Ollama',
    offline: 'Offline NLP',
  }[settings?.activeProvider || 'nim'];

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-outline-variant">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Brand & Search */}
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <div className="flex items-center gap-2 md:hidden">
            <BrieflyLogo size={28} />
            <span className="font-headline font-bold text-lg text-on-surface">Briefly</span>
          </div>

          {/* Stitch Nav Presets (Latest, Trending, Verified) */}
          <nav className="hidden sm:flex items-center gap-4 font-label-sm text-xs font-bold">
            <button
              onClick={() => onSelectFilterPreset && onSelectFilterPreset('latest')}
              className={`pb-1 transition-all ${
                activeFilterPreset === 'latest'
                  ? 'text-primary border-b-2 border-primary font-extrabold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => onSelectFilterPreset && onSelectFilterPreset('trending')}
              className={`pb-1 transition-all ${
                activeFilterPreset === 'trending'
                  ? 'text-primary border-b-2 border-primary font-extrabold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => onSelectFilterPreset && onSelectFilterPreset('verified')}
              className={`pb-1 transition-all ${
                activeFilterPreset === 'verified'
                  ? 'text-primary border-b-2 border-primary font-extrabold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Verified
            </button>
          </nav>

          {/* Search Box */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search insights..."
              className="w-full h-8 pl-8 pr-7 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Model Pill (Click opens AI Studio) */}
          <button
            onClick={onOpenStudio}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-label-sm font-semibold text-primary bg-primary-container/10 border border-primary/20 hover:bg-primary-container/20 transition"
            title="Configure in AI Studio"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{providerLabel}</span>
          </button>

          {/* AI Batch Summarize Button */}
          <button
            onClick={onBatchAnalyze}
            disabled={isBatchAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-DEFAULT text-xs font-label-sm font-bold bg-primary hover:bg-primary-container text-on-primary shadow-sm transition disabled:opacity-50"
            title="Batch synthesize pending stories"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isBatchAnalyzing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isBatchAnalyzing ? 'Synthesizing...' : 'AI Batch'}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={onSyncFeeds}
            disabled={isSyncing}
            className="p-2 rounded-DEFAULT text-on-surface-variant hover:text-on-surface bg-surface border border-outline-variant hover:bg-surface-container-low transition"
            title="Poll and sync feeds"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}