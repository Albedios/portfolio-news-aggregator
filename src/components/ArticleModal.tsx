'use client';

import React, { useEffect, useState } from 'react';
import { Article } from '@/lib/types';
import { TONE_COLORS } from '@/lib/constants';
import { BrieflyLogo } from '@/components/BrieflyLogo';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Bot,
  Bookmark,
  Share2,
  Check,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  BarChart2,
  ListChecks,
  ChevronRight,
  Clock,
  User,
} from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onToggleBookmark: (articleId: string) => void;
  onOpenPerspective?: (article: Article) => void;
}

export function ArticleModal({
  article,
  onClose,
  onToggleBookmark,
  onOpenPerspective,
}: ArticleModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const analysis = article.analysis;
  const toneStyle = analysis ? TONE_COLORS[analysis.tone.toneLabel] || TONE_COLORS.Neutral : null;

  const handleShare = () => {
    navigator.clipboard.writeText(article.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sentimentScore = analysis?.tone?.sentimentScore ?? 0;
  // Normalized 0-100 for progress bar (assuming -1 to +1 scale)
  const sentimentPercentage = Math.round(((sentimentScore + 1) / 2) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[94vh] rounded-xl flex flex-col overflow-hidden border border-outline-variant shadow-2xl bg-surface-container-lowest animate-slide-up text-on-surface">
        {/* Contextual Header (Stitch TopAppBar) */}
        <header className="px-5 py-4 border-b border-outline-variant flex items-center justify-between bg-background/90 sticky top-0 z-20 backdrop-blur-md">
          {/* Back Action */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary group px-3 py-1.5 rounded-DEFAULT hover:bg-surface-container-low transition"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-primary" />
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider">Back to Feed</span>
          </button>

          {/* Brand Center */}
          <div className="hidden sm:flex items-center gap-2 text-on-surface-variant">
            <BrieflyLogo size={20} />
            <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-on-surface">
              Briefly Intelligence Engine
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-2 rounded-DEFAULT border transition ${
                article.isBookmarked
                  ? 'bg-primary-container/10 text-primary border-primary/30'
                  : 'text-on-surface-variant hover:text-on-surface bg-surface border-outline-variant'
              }`}
              title="Bookmark article"
            >
              <Bookmark className={`w-4 h-4 ${article.isBookmarked ? 'fill-primary' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-DEFAULT text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container-low border border-outline-variant transition"
              title="Copy article link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-DEFAULT text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container-low border border-outline-variant transition"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Reader Canvas */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Article Header Meta */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-label-sm font-bold px-3 py-1 rounded-DEFAULT bg-primary-container/10 text-primary border border-primary/20">
                {article.feedTitle}
              </span>
              <span className="flex items-center gap-1 text-on-surface-variant font-label-sm">
                <Clock className="w-3.5 h-3.5" />
                {new Date(article.publishedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {article.author && (
                <span className="flex items-center gap-1 text-on-surface-variant font-label-sm">
                  <User className="w-3.5 h-3.5" />
                  By {article.author}
                </span>
              )}
            </div>

            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface leading-tight tracking-tight">
              {article.title}
            </h1>
          </div>

          {/* AI Intelligence Report Module (Stitch Verified Container) */}
          {analysis && (
            <section className="ai-summary-card p-5 sm:p-7 relative overflow-hidden group shadow-sm bg-[#F0F7FF] border border-dashed border-primary/50 rounded-xl">
              <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-DEFAULT bg-primary text-on-primary flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-headline text-lg font-bold text-on-surface leading-tight">
                        AI Intelligence Report
                      </h2>
                      <span className="text-[10px] font-label-sm text-primary font-semibold">
                        Model: {analysis.modelName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-surface px-3 py-1 rounded-full border border-primary/30 text-primary">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
                        Source Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Executive TL;DR */}
                <div className="space-y-2">
                  <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-primary block">
                    ⚡ Executive Synthesis
                  </span>
                  <p className="font-body-md text-base text-on-surface leading-relaxed">
                    {analysis.tldr}
                  </p>
                </div>

                {/* Key Takeaways & Tone Split */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                  {/* Takeaways */}
                  <div className="md:col-span-7 bg-surface-container-low p-4 sm:p-5 rounded-lg border border-outline-variant/60 space-y-3">
                    <h3 className="font-label-sm text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-primary" />
                      <span>Key Takeaways</span>
                    </h3>
                    <ul className="space-y-2.5">
                      {analysis.bulletPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-on-surface">
                          <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tone & Bias Analysis */}
                  <div className="md:col-span-5 bg-surface-container-low p-4 sm:p-5 rounded-lg border border-outline-variant/60 space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-label-sm text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2 mb-3">
                        <BarChart2 className="w-4 h-4 text-secondary" />
                        <span>Tone &amp; Sentiment Audit</span>
                      </h3>

                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold border ${toneStyle?.badge}`}>
                          {toneStyle?.icon} {analysis.tone.toneLabel}
                        </span>
                        <span className="text-xs font-mono font-bold text-on-surface">
                          Score: {sentimentScore > 0 ? `+${sentimentScore}` : sentimentScore}
                        </span>
                      </div>

                      {/* Sentiment meter */}
                      <div className="w-full h-2 rounded-full bg-outline-variant overflow-hidden mt-3">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, Math.min(95, sentimentPercentage))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-label-xs text-on-surface-variant mt-1 font-semibold">
                        <span>Critical</span>
                        <span>Neutral</span>
                        <span>Optimistic</span>
                      </div>
                    </div>

                    {analysis.tone.perspectiveSummary && (
                      <div className="pt-3 border-t border-outline-variant/60 text-xs text-on-surface-variant font-body-md">
                        <span className="font-bold text-on-surface block mb-0.5">Editorial Framing:</span>
                        {analysis.tone.perspectiveSummary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Full Article Text in Editorial Typography */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/60">
            <h3 className="font-label-sm text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Complete Editorial Text
            </h3>
            <div className="font-headline text-base sm:text-lg text-on-surface leading-relaxed space-y-4 whitespace-pre-line">
              {article.cleanedContent || article.rawSummary || 'Full content text is currently unavailable.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 sm:p-5 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
          <span className="text-xs text-on-surface-variant font-label-sm">
            Published via <strong className="text-on-surface">{article.feedTitle}</strong>
          </span>

          <div className="flex items-center gap-3">
            {onOpenPerspective && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPerspective(article);
                }}
                className="px-4 py-2 rounded-DEFAULT text-xs font-label-sm font-bold bg-secondary-container/10 hover:bg-secondary-container/20 text-secondary border border-secondary/30 transition"
              >
                Explore Perspectives
              </button>
            )}

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 rounded-DEFAULT text-xs font-label-sm font-bold bg-primary hover:bg-primary-container text-on-primary transition shadow-sm"
            >
              <span>Read on Original Outlet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}