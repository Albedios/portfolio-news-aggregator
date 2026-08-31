'use client';

import React from 'react';
import { Newspaper, Rss, Cpu, Bookmark, Settings, Sparkles, RefreshCw, Layers, ShieldCheck, HelpCircle } from 'lucide-react';
import { AppSettings } from '@/lib/types';
import { BrieflyLogo } from '@/components/BrieflyLogo';

interface SidebarProps {
  activeTab: 'feed' | 'sources' | 'studio' | 'bookmarks';
  onSelectTab: (tab: 'feed' | 'sources' | 'studio' | 'bookmarks') => void;
  settings: AppSettings | null;
  bookmarkCount: number;
  isSyncing: boolean;
  onSyncFeeds: () => void;
  onOpenFeedManager: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  settings,
  bookmarkCount,
  isSyncing,
  onSyncFeeds,
  onOpenFeedManager,
  onOpenSettings,
}: SidebarProps) {
  const providerLabel = {
    nim: 'NVIDIA NIM',
    gemini: 'Gemini 2.0 Flash',
    openai: 'GPT-4o-mini',
    ollama: 'Local Ollama',
    offline: 'Offline NLP',
  }[settings?.activeProvider || 'nim'];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full py-lg px-md w-64 border-r border-outline-variant bg-surface z-30 shadow-sm">
      {/* Brand Header (Stitch Logo) */}
      <div className="flex items-center gap-3 mb-xl px-2">
        <BrieflyLogo size={42} />
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight leading-none">
            Briefly
          </h1>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold mt-1">
            Distilled Intelligence
          </p>
        </div>
      </div>

      {/* Nav Items (Stitch SideNavBar) */}
      <nav className="flex-1 flex flex-col gap-1.5 font-label font-semibold text-xs">
        {/* Feed */}
        <button
          onClick={() => onSelectTab('feed')}
          className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all ${
            activeTab === 'feed'
              ? 'bg-primary-container/10 text-primary border-r-4 border-primary font-bold shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span className="font-body text-sm font-medium">News Feed</span>
        </button>

        {/* Sources */}
        <button
          onClick={() => onSelectTab('sources')}
          className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all ${
            activeTab === 'sources'
              ? 'bg-primary-container/10 text-primary border-r-4 border-primary font-bold shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <Rss className="w-4 h-4" />
          <span className="font-body text-sm font-medium">Sources</span>
        </button>

        {/* AI Studio */}
        <button
          onClick={() => onSelectTab('studio')}
          className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all ${
            activeTab === 'studio'
              ? 'bg-primary-container/10 text-primary border-r-4 border-primary font-bold shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span className="font-body text-sm font-medium">AI Studio</span>
        </button>

        {/* Bookmarks */}
        <button
          onClick={() => onSelectTab('bookmarks')}
          className={`flex items-center justify-between px-3.5 py-3 rounded-lg transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-primary-container/10 text-primary border-r-4 border-primary font-bold shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'fill-primary text-primary' : ''}`} />
            <span className="font-body text-sm font-medium">Saved Stories</span>
          </div>
          {bookmarkCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-fixed text-on-primary-fixed font-bold border border-primary/20 font-mono">
              {bookmarkCount}
            </span>
          )}
        </button>
      </nav>

      {/* Bottom Controls */}
      <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-outline-variant">
        {/* Quick Sync Button */}
        <button
          onClick={onSyncFeeds}
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-container text-on-primary rounded-DEFAULT font-label font-bold text-xs shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync All Feeds'}</span>
        </button>

        {/* Active Engine Card */}
        <button
          onClick={() => onSelectTab('studio')}
          className="p-3 rounded-lg bg-surface-container-low border border-outline-variant hover:border-primary/50 text-left transition"
          title="Click to configure AI Model"
        >
          <div className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant flex items-center justify-between">
            <span>Engine Active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-xs font-bold text-primary truncate mt-0.5">
            {providerLabel}
          </div>
        </button>

        <div className="flex items-center justify-between pt-1 text-on-surface-variant text-xs font-label">
          <button
            onClick={() => onSelectTab('studio')}
            className="flex items-center gap-1.5 hover:text-on-surface transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => onSelectTab('sources')}
            className="flex items-center gap-1.5 hover:text-on-surface transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sources</span>
          </button>
        </div>
      </div>
    </aside>
  );
}