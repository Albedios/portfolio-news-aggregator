'use client';

import React, { useEffect, useState } from 'react';
import { Article } from '@/lib/types';
import { TONE_COLORS } from '@/lib/constants';
import { X, SplitSquareVertical, ExternalLink, Compass, CheckCircle2 } from 'lucide-react';

interface PerspectiveMatrixProps {
  article: Article | null;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
}

export function PerspectiveMatrix({ article, onClose, onSelectArticle }: PerspectiveMatrixProps) {
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!article) return;
    setLoading(true);
    fetch(`/api/articles/${article.id}/perspectives`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.relatedArticles) {
          setRelated(data.relatedArticles);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [article]);

  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-xl flex flex-col overflow-hidden border border-outline-variant shadow-2xl bg-surface-container-lowest text-on-surface animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant flex items-center justify-between bg-background/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-DEFAULT bg-primary-container/10 border border-primary/30">
              <SplitSquareVertical className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface tracking-tight">
                Balanced Perspectives Matrix
              </h2>
              <p className="text-[11px] font-label-sm text-on-surface-variant">
                Cross-source perspective analysis on overlapping news stories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-DEFAULT text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container border border-outline-variant transition"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Target Reference Story */}
          <div className="p-4 sm:p-5 rounded-xl bg-primary-container/10 border border-primary/30 shadow-sm">
            <span className="text-[10px] font-label-sm font-extrabold text-primary uppercase tracking-wider block mb-1">
              Reference Story • Source: {article.feedTitle}
            </span>
            <h3 className="text-base sm:text-lg font-headline font-extrabold text-on-surface mb-2 leading-snug">
              {article.title}
            </h3>
            {article.analysis && (
              <div className="flex items-center space-x-2 text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${TONE_COLORS[article.analysis.tone.toneLabel]?.badge}`}>
                  {TONE_COLORS[article.analysis.tone.toneLabel]?.icon} {article.analysis.tone.toneLabel}
                </span>
                <span className="text-on-surface font-mono font-bold">
                  Sentiment: {article.analysis.tone.sentimentScore}
                </span>
              </div>
            )}
          </div>

          {/* Cross Source Comparison Grid */}
          <div>
            <h3 className="text-xs font-label-sm font-extrabold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-primary" />
              <span>Cross-Feed Coverage ({related.length} Matches Found)</span>
            </h3>

            {loading ? (
              <div className="p-12 text-center text-on-surface-variant text-sm space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
                <p className="font-label-sm">Auditing article embeddings and entity overlap...</p>
              </div>
            ) : related.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low rounded-xl text-on-surface-variant text-xs sm:text-sm space-y-2 border border-outline-variant">
                <p className="font-semibold text-on-surface font-label-sm">No syndicated stories found for this specific event yet.</p>
                <p className="text-on-surface-variant text-xs font-body-md">Sync additional RSS feeds to populate broader coverage viewpoints.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((rel) => {
                  const relTone = rel.analysis ? TONE_COLORS[rel.analysis.tone.toneLabel] : null;
                  return (
                    <div key={rel.id} className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-outline-variant hover:border-primary/40 transition">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary-container/10 border border-primary/20 font-label-sm">
                            {rel.feedTitle}
                          </span>
                          {rel.analysis && (
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${relTone?.badge}`}>
                              {relTone?.icon} {rel.analysis.tone.toneLabel}
                            </span>
                          )}
                        </div>
                        <h4
                          onClick={() => {
                            onClose();
                            onSelectArticle(rel);
                          }}
                          className="text-sm font-headline font-bold text-on-surface mb-2 line-clamp-2 hover:text-primary cursor-pointer transition"
                        >
                          {rel.title}
                        </h4>
                        {rel.analysis ? (
                          <p className="text-xs text-on-surface line-clamp-3 bg-surface p-3 rounded-lg border border-outline-variant font-body-md">
                            {rel.analysis.tldr}
                          </p>
                        ) : (
                          <p className="text-xs text-on-surface-variant line-clamp-2 font-body-md">
                            {rel.rawSummary || rel.cleanedContent}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectArticle(rel);
                          }}
                          className="text-xs font-label-sm font-semibold text-primary hover:underline transition"
                        >
                          View Full Deep Dive →
                        </button>
                        <a
                          href={rel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-on-surface-variant hover:text-on-surface flex items-center space-x-1 p-1 rounded hover:bg-surface-container"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}