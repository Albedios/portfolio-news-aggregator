'use client';

import React, { useState, useEffect } from 'react';
import { Feed, FeedCategory } from '@/lib/types';
import { PRESET_DISCOVER_FEEDS } from '@/lib/constants';
import { X, Plus, Trash2, Rss, AlertCircle, RefreshCw, Compass, Check } from 'lucide-react';

interface FeedManagerModalProps {
  feeds: Feed[];
  isOpen: boolean;
  onClose: () => void;
  onAddFeed: (feedData: { title: string; url: string; category: FeedCategory }) => Promise<boolean>;
  onDeleteFeed: (id: string) => Promise<void>;
  onSyncFeed: (id: string) => Promise<void>;
}

export function FeedManagerModal({
  feeds,
  isOpen,
  onClose,
  onAddFeed,
  onDeleteFeed,
  onSyncFeed,
}: FeedManagerModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FeedCategory>('Tech');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [addingPresetUrl, setAddingPresetUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const success = await onAddFeed({ title: title.trim(), url: url.trim(), category });
      if (success) {
        setUrl('');
        setTitle('');
      } else {
        setErrorMessage('Failed to add feed. Please verify that the URL is a valid RSS/Atom feed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error validating RSS URL');
    } finally {
      setIsSubmitting(false);
    }
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

  const handleSyncOne = async (id: string) => {
    setSyncingId(id);
    await onSyncFeed(id);
    setSyncingId(null);
  };

  const existingUrls = new Set(feeds.map((f) => f.url));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl max-h-[92vh] rounded-3xl flex flex-col overflow-hidden border border-slate-700/80 shadow-2xl bg-[#0b1120] ring-1 ring-white/10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
              <Rss className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                RSS Feed Manager ({feeds.length} Sources)
              </h2>
              <p className="text-[11px] text-slate-400">
                Register custom feeds or discover curated global publications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Add New Feed Form */}
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border border-indigo-500/40 bg-indigo-950/20 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                Add Custom RSS / Atom Feed
              </h3>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <input
                type="url"
                required
                placeholder="https://example.com/rss.xml"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Feed Title (Optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedCategory)}
                  className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Tech">Category: Tech</option>
                  <option value="World">Category: World</option>
                  <option value="Science">Category: Science</option>
                  <option value="Business">Category: Business</option>
                  <option value="AI">Category: AI</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/25 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Validating & Indexing Feed...' : 'Register & Sync Feed'}</span>
            </button>
          </form>

          {/* Preset Feeds Quick Add Library */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Discover & Quick-Add Curated Feeds</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_DISCOVER_FEEDS.map((preset) => {
                const isAdded = existingUrls.has(preset.url);
                const isAdding = addingPresetUrl === preset.url;
                return (
                  <div
                    key={preset.url}
                    className="glass-card rounded-xl p-3 flex flex-col justify-between border border-slate-800/80 hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{preset.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{preset.desc}</p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex justify-end">
                      {isAdded ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddPreset(preset)}
                          disabled={isAdding}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition flex items-center space-x-1 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isAdding ? 'Adding...' : 'Add Feed'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Feeds List */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Active Registered Feeds ({feeds.length})
            </h3>
            <div className="space-y-2">
              {feeds.map((f) => (
                <div
                  key={f.id}
                  className="glass-card rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-white truncate">{f.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {f.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {f.articleCount || 0} items
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate font-mono">{f.url}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleSyncOne(f.id)}
                      disabled={syncingId === f.id}
                      className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                      title="Sync this feed now"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingId === f.id ? 'animate-spin text-cyan-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => onDeleteFeed(f.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/15 border border-slate-700 transition"
                      title="Delete feed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}