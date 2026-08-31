'use client';

import React, { useState } from 'react';
import { Feed, FeedCategory } from '@/lib/types';
import { PRESET_DISCOVER_FEEDS } from '@/lib/constants';
import {
  Rss,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  Compass,
  Radio,
  ExternalLink,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
} from 'lucide-react';

interface SourceManagementViewProps {
  feeds: Feed[];
  isSyncing: boolean;
  onAddFeed: (feedData: { title: string; url: string; category: FeedCategory }) => Promise<boolean>;
  onDeleteFeed: (id: string) => Promise<void>;
  onSyncFeed: (id: string) => Promise<void>;
  onSyncAllFeeds: () => void;
  onOpenFeedModal: () => void;
}

export function SourceManagementView({
  feeds,
  isSyncing,
  onAddFeed,
  onDeleteFeed,
  onSyncFeed,
  onSyncAllFeeds,
  onOpenFeedModal,
}: SourceManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [syncingFeedId, setSyncingFeedId] = useState<string | null>(null);
  const [addingPresetUrl, setAddingPresetUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New Feed Form state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<FeedCategory>('Tech');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const categories = ['All', 'Tech', 'AI', 'Finance', 'Science', 'World', 'Culture'];

  const filteredFeeds = feeds.filter((feed) => {
    const matchesSearch =
      feed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feed.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || feed.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const existingUrls = new Set(feeds.map((f) => f.url));

  const handleSyncOne = async (id: string) => {
    setSyncingFeedId(id);
    await onSyncFeed(id);
    setSyncingFeedId(null);
  };

  const handleAddPreset = async (preset: (typeof PRESET_DISCOVER_FEEDS)[0]) => {
    setAddingPresetUrl(preset.url);
    await onAddFeed({
      title: preset.title,
      url: preset.url,
      category: preset.category,
    });
    setAddingPresetUrl(null);
  };

  const handleCreateFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const success = await onAddFeed({
        title: newTitle.trim(),
        url: newUrl.trim(),
        category: newCategory,
      });

      if (success) {
        setNewTitle('');
        setNewUrl('');
        setIsAddFormOpen(false);
      } else {
        setFormError('Failed to parse or reach RSS feed URL. Please ensure it is a valid XML/Atom feed.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to add feed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-on-surface">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Radio className="w-4 h-4" />
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider">Feed Registry</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
            Source &amp; Feed Management
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
            Configure live RSS, Atom, and publication feeds. Manage automated polling and category tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSyncAllFeeds}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-DEFAULT bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant text-xs font-label-sm font-bold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
            <span>{isSyncing ? 'Syncing Feeds...' : 'Sync All Feeds'}</span>
          </button>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-DEFAULT bg-primary hover:bg-primary-container text-on-primary text-xs font-label-sm font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddFormOpen ? 'Cancel' : 'Add Custom Feed'}</span>
          </button>
        </div>
      </div>

      {/* Add Feed Inline Collapsible Drawer */}
      {isAddFormOpen && (
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-primary/40 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="font-headline text-lg font-bold text-on-surface">Register New RSS Source</h2>
            </div>
            <span className="text-xs font-label-sm text-on-surface-variant">Supports RSS 2.0, Atom &amp; JSON Feeds</span>
          </div>

          <form onSubmit={handleCreateFeed} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-xs font-label-sm font-semibold text-on-surface mb-1">
                  RSS/Atom Feed URL <span className="text-primary">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="w-full h-10 px-3.5 bg-surface border border-outline-variant rounded-DEFAULT text-xs sm:text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-label-sm font-semibold text-on-surface mb-1">
                  Publication Title <span className="text-on-surface-variant">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Auto-detected if blank"
                  className="w-full h-10 px-3.5 bg-surface border border-outline-variant rounded-DEFAULT text-xs sm:text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-label-sm font-semibold text-on-surface mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as FeedCategory)}
                  className="w-full h-10 px-3 bg-surface border border-outline-variant rounded-DEFAULT text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                >
                  <option value="Tech">Tech</option>
                  <option value="AI">AI</option>
                  <option value="Finance">Finance</option>
                  <option value="Science">Science</option>
                  <option value="World">World</option>
                  <option value="Culture">Culture</option>
                </select>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-DEFAULT bg-red-50 border border-red-200 text-red-700 text-xs font-label-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="px-4 py-2 rounded-DEFAULT text-xs font-label-sm font-bold text-on-surface-variant hover:text-on-surface transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-DEFAULT bg-primary hover:bg-primary-container text-on-primary text-xs font-label-sm font-bold shadow-sm transition disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Validating Feed...' : 'Register Feed'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-label-sm font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search registered sources..."
            className="w-full h-9 pl-9 pr-4 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
      </div>

      {/* Feed Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <span>Active Publications</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono font-normal">
              {filteredFeeds.length}
            </span>
          </h3>
        </div>

        {filteredFeeds.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant space-y-3">
            <Rss className="w-8 h-8 text-outline mx-auto" />
            <h4 className="font-headline text-base font-bold text-on-surface">No sources found</h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto font-body-md">
              No RSS sources matched your filter. Try clearing the search query or explore the curated presets below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeeds.map((feed) => (
              <div
                key={feed.id}
                className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex flex-col justify-between group hover:shadow-sm transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-DEFAULT bg-surface-container flex items-center justify-center text-primary font-bold font-label-sm text-xs shrink-0 border border-outline-variant">
                        {feed.title.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-headline font-bold text-sm text-on-surface truncate group-hover:text-primary transition">
                          {feed.title}
                        </h4>
                        <span className="text-[10px] font-label-xs font-bold uppercase tracking-wider text-on-surface-variant px-2 py-0.5 rounded bg-surface-container border border-outline-variant inline-block">
                          {feed.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSyncOne(feed.id)}
                        disabled={syncingFeedId === feed.id}
                        className="p-1.5 rounded-DEFAULT text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
                        title="Sync this feed"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            syncingFeedId === feed.id ? 'animate-spin text-primary' : ''
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => onDeleteFeed(feed.id)}
                        className="p-1.5 rounded-DEFAULT text-on-surface-variant hover:text-error hover:bg-red-50 transition"
                        title="Delete source"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant font-mono truncate mb-3">{feed.url}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60 text-[11px] font-label-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Active</span>
                  </span>
                  <span>
                    Last Synced:{' '}
                    {feed.lastPolledAt
                      ? new Date(feed.lastPolledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Never'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Curated Presets Discovery Drawer */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-secondary" />
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Curated Global Presets</h3>
              <p className="text-xs text-on-surface-variant font-body-md">1-click subscribe to reputable tech, AI, and finance publications</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {PRESET_DISCOVER_FEEDS.map((preset) => {
            const isAlreadyAdded = existingUrls.has(preset.url);
            const isAdding = addingPresetUrl === preset.url;

            return (
              <div
                key={preset.url}
                className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant hover:border-primary/50 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-label-xs font-bold uppercase tracking-wider text-secondary">
                      {preset.category}
                    </span>
                    {isAlreadyAdded && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-label-sm font-bold">
                        <Check className="w-3 h-3" /> Subscribed
                      </span>
                    )}
                  </div>
                  <h4 className="font-headline font-bold text-sm text-on-surface leading-snug group-hover:text-primary transition">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{preset.desc}</p>
                </div>

                <div className="pt-3 mt-2 border-t border-outline-variant/60">
                  {isAlreadyAdded ? (
                    <button
                      disabled
                      className="w-full py-1.5 rounded-DEFAULT bg-surface text-on-surface-variant text-xs font-label-sm font-bold cursor-not-allowed border border-outline-variant"
                    >
                      Added
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddPreset(preset)}
                      disabled={isAdding}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-DEFAULT bg-primary-container/10 hover:bg-primary-container/20 text-primary border border-primary/30 text-xs font-label-sm font-bold transition disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAdding ? 'Connecting...' : 'Subscribe'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
