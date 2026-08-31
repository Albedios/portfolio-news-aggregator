'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { Navbar } from '@/components/Navbar';
import { ToneFilterBar } from '@/components/ToneFilterBar';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleModal } from '@/components/ArticleModal';
import { PerspectiveMatrix } from '@/components/PerspectiveMatrix';
import { SourceManagementView } from '@/components/SourceManagementView';
import { AIStudioView } from '@/components/AIStudioView';
import { FeedManagerModal } from '@/components/FeedManagerModal';
import { SettingsModal } from '@/components/SettingsModal';
import {
  Article,
  Feed,
  AppSettings,
  AggregatorStats,
  FilterOptions,
  LLMProviderType,
  FeedCategory,
} from '@/lib/types';
import { RefreshCw, Rss, Bookmark, Newspaper, Cpu, Sparkles, SlidersHorizontal, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [stats, setStats] = useState<AggregatorStats | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<'feed' | 'sources' | 'studio' | 'bookmarks'>('feed');
  const [activeFilterPreset, setActiveFilterPreset] = useState<'latest' | 'trending' | 'verified'>('latest');

  const [filter, setFilter] = useState<FilterOptions>({
    category: undefined,
    tone: undefined,
    search: '',
    onlyAnalyzed: false,
    onlyBookmarked: false,
    maxClickbait: 5,
    page: 1,
    limit: 60,
  });

  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [analyzingArticleIds, setAnalyzingArticleIds] = useState<Set<string>>(new Set());

  // Modals state
  const [selectedReaderArticle, setSelectedReaderArticle] = useState<Article | null>(null);
  const [selectedPerspectiveArticle, setSelectedPerspectiveArticle] = useState<Article | null>(null);
  const [isFeedManagerOpen, setIsFeedManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Notification / toast banner
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showBanner = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setBannerMessage({ text, type });
    setTimeout(() => {
      setBannerMessage((current) => (current?.text === text ? null : current));
    }, 4500);
  };

  // 1. Fetch Feeds
  const loadFeeds = useCallback(async () => {
    try {
      const res = await fetch('/api/feeds');
      const data = await res.json();
      if (data.success) setFeeds(data.feeds);
    } catch (err) {
      console.error('Failed to load feeds:', err);
    }
  }, []);

  // 2. Fetch Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // 3. Fetch Settings
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  // 4. Fetch Articles
  const loadArticles = useCallback(async () => {
    setIsLoadingArticles(true);
    try {
      const params = new URLSearchParams();
      if (filter.search) params.append('search', filter.search);
      if (filter.category && filter.category !== 'All') params.append('category', filter.category);
      if (filter.tone && filter.tone !== 'All') params.append('tone', filter.tone);
      if (filter.feedId && filter.feedId !== 'All') params.append('feedId', filter.feedId);
      if (filter.onlyAnalyzed) params.append('onlyAnalyzed', 'true');
      if (filter.onlyBookmarked) params.append('onlyBookmarked', 'true');
      if (filter.maxClickbait !== undefined) params.append('maxClickbait', filter.maxClickbait.toString());
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());

      const res = await fetch(`/api/articles?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setIsLoadingArticles(false);
    }
  }, [filter]);

  // Initial Boot
  useEffect(() => {
    loadFeeds();
    loadStats();
    loadSettings();
  }, [loadFeeds, loadStats, loadSettings]);

  // Reload articles on filter change
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Handle Tab Switch
  const handleSelectTab = (tab: 'feed' | 'sources' | 'studio' | 'bookmarks') => {
    setActiveNavTab(tab);
    if (tab === 'bookmarks') {
      setFilter((prev) => ({ ...prev, onlyBookmarked: true, page: 1 }));
    } else if (tab === 'feed') {
      setFilter((prev) => ({ ...prev, onlyBookmarked: false, page: 1 }));
    }
  };

  // Handle Top Filter Preset (Latest, Trending, Verified)
  const handleSelectFilterPreset = (preset: 'latest' | 'trending' | 'verified') => {
    setActiveFilterPreset(preset);
    setActiveNavTab('feed');
    if (preset === 'latest') {
      setFilter((prev) => ({
        ...prev,
        onlyAnalyzed: false,
        onlyBookmarked: false,
        tone: undefined,
        category: undefined,
        page: 1,
      }));
    } else if (preset === 'trending') {
      setFilter((prev) => ({
        ...prev,
        onlyAnalyzed: false,
        onlyBookmarked: false,
        page: 1,
      }));
    } else if (preset === 'verified') {
      setFilter((prev) => ({
        ...prev,
        onlyAnalyzed: true,
        onlyBookmarked: false,
        page: 1,
      }));
    }
  };

  // Sync All Feeds
  const handleSyncFeeds = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/feeds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        showBanner(`Sync complete! Ingested ${data.totalNewArticles} new stories from ${data.feedsProcessed} feeds.`, 'success');
        await Promise.all([loadArticles(), loadStats(), loadFeeds()]);
      } else {
        showBanner(`Sync error: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showBanner(`Sync error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Single Feed
  const handleSyncSingleFeed = async (feedId: string) => {
    try {
      const res = await fetch('/api/feeds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId }),
      });
      const data = await res.json();
      if (data.success) {
        showBanner(`Feed synced! Found ${data.totalNewArticles} new items.`, 'success');
        await Promise.all([loadArticles(), loadStats(), loadFeeds()]);
      }
    } catch (err: any) {
      showBanner(`Feed sync failed: ${err.message}`, 'error');
    }
  };

  // Batch Analyze Unanalyzed Articles
  const handleBatchAnalyze = async () => {
    setIsBatchAnalyzing(true);
    try {
      const res = await fetch('/api/articles/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 12 }),
      });
      const data = await res.json();
      if (data.success) {
        showBanner(`AI Batch complete: Summarized and classified ${data.processed || 0} articles!`, 'success');
        await Promise.all([loadArticles(), loadStats()]);
      } else {
        showBanner(`AI Batch error: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showBanner(`Batch analysis error: ${err.message}`, 'error');
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  // On-Demand Analyze Single Article
  const handleAnalyzeArticle = async (articleId: string, provider?: LLMProviderType) => {
    setAnalyzingArticleIds((prev) => new Set(prev).add(articleId));
    try {
      const res = await fetch(`/api/articles/${articleId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === articleId ? { ...a, analysis: data.analysis } : a))
        );
        loadStats();
        showBanner('Article summarized and tone classified successfully!', 'success');
      } else {
        showBanner(`Analysis failed: ${data.error}`, 'error');
      }
    } catch (err: any) {
      showBanner(`Analysis error: ${err.message}`, 'error');
    } finally {
      setAnalyzingArticleIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (articleId: string) => {
    try {
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, isBookmarked: !a.isBookmarked } : a))
      );
      if (selectedReaderArticle && selectedReaderArticle.id === articleId) {
        setSelectedReaderArticle((prev) => (prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null));
      }

      const res = await fetch(`/api/articles/${articleId}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        loadStats();
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  // Add Custom Feed
  const handleAddFeed = async (feedInput: { title: string; url: string; category: FeedCategory }): Promise<boolean> => {
    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedInput),
      });
      const data = await res.json();
      if (data.success) {
        showBanner(`Feed "${data.feed.title}" registered successfully! Syncing...`, 'success');
        await handleSyncSingleFeed(data.feed.id);
        await Promise.all([loadFeeds(), loadArticles(), loadStats()]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Delete Feed
  const handleDeleteFeed = async (feedId: string) => {
    try {
      const res = await fetch(`/api/feeds/${feedId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showBanner('Feed deleted successfully', 'info');
        await Promise.all([loadFeeds(), loadArticles(), loadStats()]);
      }
    } catch (err: any) {
      showBanner(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (updated: Partial<AppSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showBanner('AI model settings updated successfully!', 'success');
      }
    } catch (err: any) {
      showBanner(`Settings update error: ${err.message}`, 'error');
    }
  };

  const handleResetFilters = () => {
    setFilter({
      category: undefined,
      tone: undefined,
      search: '',
      onlyAnalyzed: false,
      onlyBookmarked: false,
      maxClickbait: 5,
      page: 1,
      limit: 60,
    });
    setActiveFilterPreset('latest');
    setActiveNavTab('feed');
  };

  return (
    <div className="min-h-screen flex bg-background text-on-background antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* 1. Desktop Left Sidebar (Stitch SideNavBar) */}
      <Sidebar
        activeTab={activeNavTab}
        onSelectTab={handleSelectTab}
        settings={settings}
        bookmarkCount={stats?.bookmarkedArticles || 0}
        isSyncing={isSyncing}
        onSyncFeeds={handleSyncFeeds}
        onOpenFeedManager={() => setActiveNavTab('sources')}
        onOpenSettings={() => setActiveNavTab('studio')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          settings={settings}
          isSyncing={isSyncing}
          isBatchAnalyzing={isBatchAnalyzing}
          searchQuery={filter.search || ''}
          activeFilterPreset={activeFilterPreset}
          onSelectFilterPreset={handleSelectFilterPreset}
          onSearchChange={(q) => setFilter((prev) => ({ ...prev, search: q, page: 1 }))}
          onSyncFeeds={handleSyncFeeds}
          onBatchAnalyze={handleBatchAnalyze}
          onOpenStudio={() => setActiveNavTab('studio')}
        />

        {/* Floating Notification Toast */}
        {bannerMessage && (
          <div className="px-4 sm:px-6 lg:px-8 pt-4">
            <div
              className={`px-4 py-3 rounded-xl text-xs font-bold font-label-sm flex items-center justify-between border shadow-sm animate-fade-in ${
                bannerMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : bannerMessage.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-primary-container/10 text-primary border-primary/30'
              }`}
            >
              <span>{bannerMessage.text}</span>
              <button
                onClick={() => setBannerMessage(null)}
                className="text-on-surface-variant hover:text-on-surface ml-2 text-sm p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* VIEW 1: Sources Management Full Screen (Stitch Screen 73d6da8c) */}
        {activeNavTab === 'sources' && (
          <main className="flex-1 pb-24">
            <SourceManagementView
              feeds={feeds}
              isSyncing={isSyncing}
              onAddFeed={handleAddFeed}
              onDeleteFeed={handleDeleteFeed}
              onSyncFeed={handleSyncSingleFeed}
              onSyncAllFeeds={handleSyncFeeds}
              onOpenFeedModal={() => setIsFeedManagerOpen(true)}
            />
          </main>
        )}

        {/* VIEW 2: AI Studio & Preferences Full Screen (Stitch Screen 5af65503) */}
        {activeNavTab === 'studio' && (
          <main className="flex-1 pb-24">
            <AIStudioView
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          </main>
        )}

        {/* VIEW 3: Feed Stream & Bookmarks (Stitch Screen b8a29e7a) */}
        {(activeNavTab === 'feed' || activeNavTab === 'bookmarks') && (
          <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8 items-start justify-center">
            {/* Center Column: Feed Items */}
            <main className="flex-1 max-w-[760px] w-full min-w-0">
              {/* Tone and Mood Spectrum Filters */}
              <ToneFilterBar
                filter={filter}
                onChange={(updated) => setFilter((prev) => ({ ...prev, ...updated }))}
                onReset={handleResetFilters}
              />

              {/* Bookmarks Header indicator if viewing bookmarks */}
              {activeNavTab === 'bookmarks' && (
                <div className="flex items-center justify-between p-3.5 mb-4 rounded-xl bg-primary-container/10 border border-primary/20 text-primary text-xs font-label-sm font-bold">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 fill-primary text-primary" />
                    <span>Saved Reading Collection ({articles.length} stories)</span>
                  </div>
                  <button
                    onClick={() => handleSelectTab('feed')}
                    className="text-primary hover:underline"
                  >
                    View All Stories
                  </button>
                </div>
              )}

              {/* Articles Stream */}
              {isLoadingArticles ? (
                <div className="p-16 text-center text-on-surface-variant space-y-3 font-body-md">
                  <RefreshCw className="w-7 h-7 animate-spin mx-auto text-primary" />
                  <p className="text-sm font-semibold text-on-surface font-label-sm">
                    Streaming verified intelligence...
                  </p>
                </div>
              ) : articles.length === 0 ? (
                <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant space-y-4 max-w-lg mx-auto my-8 animate-fade-in">
                  {filter.onlyBookmarked ? (
                    <Bookmark className="w-10 h-10 text-primary/60 mx-auto" />
                  ) : (
                    <Rss className="w-10 h-10 text-outline mx-auto" />
                  )}
                  <h3 className="font-headline-md text-xl font-bold text-on-surface">
                    {filter.onlyBookmarked ? 'No saved articles yet' : 'No articles match your active filter'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-body-md max-w-sm mx-auto">
                    {filter.onlyBookmarked
                      ? 'Bookmark any article using the bookmark icon to view it in your saved reading list.'
                      : 'Try broadening your search keywords, clearing tone filters, or sync feeds to ingest the latest global stories.'}
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2 font-label-sm">
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-DEFAULT text-xs font-bold bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant transition"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={handleSyncFeeds}
                      disabled={isSyncing}
                      className="px-4 py-2 rounded-DEFAULT text-xs font-bold bg-primary hover:bg-primary-container text-on-primary transition shadow-sm"
                    >
                      Sync RSS Feeds
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5 pb-24 animate-fade-in">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onOpenReader={(art) => setSelectedReaderArticle(art)}
                      onOpenPerspective={(art) => setSelectedPerspectiveArticle(art)}
                      onAnalyzeArticle={(id, prov) => handleAnalyzeArticle(id, prov)}
                      onToggleBookmark={(id) => handleToggleBookmark(id)}
                      isAnalyzing={analyzingArticleIds.has(article.id)}
                    />
                  ))}
                </div>
              )}
            </main>

            {/* Right Column: Quick AI Insights & Trending */}
            <RightSidebar
              stats={stats}
              trendingArticles={articles}
              onSelectArticle={(art) => setSelectedReaderArticle(art)}
            />
          </div>
        )}

        {/* Mobile Bottom Navigation Bar (Stitch BottomNavBar) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-outline-variant bg-background/95 backdrop-blur-md p-2 flex justify-around items-center z-40">
          <button
            onClick={() => handleSelectTab('feed')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-label-sm font-bold transition ${
              activeNavTab === 'feed' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Newspaper className="w-5 h-5" />
            <span>Feed</span>
          </button>
          <button
            onClick={() => handleSelectTab('sources')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-label-sm font-bold transition ${
              activeNavTab === 'sources' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Rss className="w-5 h-5" />
            <span>Sources</span>
          </button>
          <button
            onClick={() => handleSelectTab('studio')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-label-sm font-bold transition ${
              activeNavTab === 'studio' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Cpu className="w-5 h-5" />
            <span>AI Studio</span>
          </button>
          <button
            onClick={() => handleSelectTab('bookmarks')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-label-sm font-bold transition ${
              activeNavTab === 'bookmarks' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span>Saved</span>
          </button>
        </div>
      </div>

      {/* Reader Deep Dive Modal (Stitch Article Detail View Screen 22f4c129) */}
      <ArticleModal
        article={selectedReaderArticle}
        onClose={() => setSelectedReaderArticle(null)}
        onToggleBookmark={(id) => handleToggleBookmark(id)}
        onOpenPerspective={(art) => setSelectedPerspectiveArticle(art)}
      />

      {/* Perspectives Matrix Modal */}
      <PerspectiveMatrix
        article={selectedPerspectiveArticle}
        onClose={() => setSelectedPerspectiveArticle(null)}
        onSelectArticle={(art) => setSelectedReaderArticle(art)}
      />

      {/* Feed Manager Modal */}
      <FeedManagerModal
        feeds={feeds}
        isOpen={isFeedManagerOpen}
        onClose={() => setIsFeedManagerOpen(false)}
        onAddFeed={handleAddFeed}
        onDeleteFeed={handleDeleteFeed}
        onSyncFeed={handleSyncSingleFeed}
      />

      {/* Settings Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}