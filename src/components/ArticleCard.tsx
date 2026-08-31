'use client';

import React, { useState } from 'react';
import { Article, LLMProviderType } from '@/lib/types';
import { TONE_COLORS } from '@/lib/constants';
import {
  ExternalLink,
  Sparkles,
  Flame,
  SplitSquareVertical,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Copy,
  Check,
  ShieldCheck,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onOpenReader: (article: Article) => void;
  onOpenPerspective: (article: Article) => void;
  onAnalyzeArticle: (articleId: string, provider?: LLMProviderType) => void;
  onToggleBookmark: (articleId: string) => void;
  isAnalyzing: boolean;
}

export function ArticleCard({
  article,
  onOpenReader,
  onOpenPerspective,
  onAnalyzeArticle,
  onToggleBookmark,
  isAnalyzing,
}: ArticleCardProps) {
  const [showCleanHeadline, setShowCleanHeadline] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(() => {
    // Generate deterministic like count based on article title hash
    let hash = 0;
    for (let i = 0; i < article.title.length; i++) hash = (hash << 5) - hash + article.title.charCodeAt(i);
    return Math.abs(hash % 120) + 12;
  });
  const [hasLiked, setHasLiked] = useState(false);

  const analysis = article.analysis;
  const toneStyle = analysis ? TONE_COLORS[analysis.tone.toneLabel] || TONE_COLORS.Neutral : null;

  const isClickbaity = analysis && analysis.tone.clickbaitRating >= 2;
  const headline = showCleanHeadline && analysis ? analysis.tone.cleanHeadline : article.title;

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLiked) {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleCopySummary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!analysis) return;
    const summaryText = `${analysis.tldr}\n\nKey Takeaways:\n${analysis.bulletPoints.map((b) => `• ${b}`).join('\n')}`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between relative group hover:shadow-md transition-all duration-200">
      {/* Header Metadata */}
      <div>
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt=""
                className="w-5 h-5 rounded-full object-cover border border-outline-variant shrink-0 grayscale"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary-container/10 text-primary border border-primary/20 flex items-center justify-center text-[10px] font-bold shrink-0 font-label-xs">
                {article.feedTitle.charAt(0)}
              </div>
            )}
            <span className="font-label-xs text-[10px] uppercase tracking-wider text-on-surface-variant truncate font-semibold">
              {article.feedTitle} • {formattedDate}
            </span>
          </div>

          {/* Tone Badge & Bookmark */}
          <div className="flex items-center gap-2 shrink-0">
            {analysis ? (
              <span
                className={`px-2.5 py-0.5 rounded-full font-label-xs text-[10px] uppercase font-bold tracking-wider border flex items-center gap-1 shadow-sm ${toneStyle?.badge}`}
              >
                <span>{toneStyle?.icon}</span>
                <span>{analysis.tone.toneLabel}</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full font-label-xs text-[9px] uppercase font-semibold text-on-surface-variant bg-surface-container border border-outline-variant">
                Pending AI
              </span>
            )}

            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-1.5 rounded-lg transition ${
                article.isBookmarked
                  ? 'text-primary bg-primary-fixed/30'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
              title={article.isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              <Bookmark className={`w-4 h-4 ${article.isBookmarked ? 'fill-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* Editorial Headline */}
        <h2
          onClick={() => onOpenReader(article)}
          className="font-headline-md text-lg sm:text-xl font-bold text-on-surface group-hover:text-primary transition-colors cursor-pointer leading-snug tracking-tight mb-2.5"
        >
          {headline}
        </h2>

        {/* Clickbait Rewrite Switcher */}
        {isClickbaity && (
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setShowCleanHeadline(!showCleanHeadline)}
              className="text-[11px] font-label-sm font-bold text-amber-800 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition shadow-sm"
              title="Toggle sensational vs factual headline"
            >
              <Flame className="w-3 h-3 text-amber-600" />
              <span>{showCleanHeadline ? 'Original Headline' : 'Factual Reframing Available'}</span>
            </button>
          </div>
        )}

        {/* Stitch-Styled AI Summary Card */}
        {analysis ? (
          <div className="ai-summary-card p-3 rounded-lg mt-2 relative">
            <div className="absolute -top-2.5 right-3 bg-surface border border-primary text-primary text-[10px] font-label-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span>AI Brief</span>
            </div>

            <p className="font-body-md text-xs sm:text-[14px] text-on-surface-variant leading-relaxed font-normal mb-2 pt-0.5">
              {analysis.tldr}
            </p>

            {/* Bullet Points */}
            <ul className="space-y-1 text-xs text-on-surface-variant font-body-md border-t border-primary/20 pt-2">
              {analysis.bulletPoints.slice(0, 2).map((pt, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="font-body-md text-xs text-on-surface-variant line-clamp-3 mt-2 leading-relaxed">
            {article.rawSummary || article.cleanedContent || 'No preview summary available.'}
          </p>
        )}
      </div>

      {/* Action Footer (Stitch Cards Footer) */}
      <div className="mt-3 pt-3 border-t border-outline-variant/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Like / Helpful Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-label-sm font-semibold transition ${
              hasLiked ? 'text-primary bg-primary-fixed/20' : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title="Helpful insight"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-primary text-primary' : ''}`} />
            <span>{likesCount}</span>
          </button>

          {/* Perspective Matrix Trigger */}
          <button
            onClick={() => onOpenPerspective(article)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm font-semibold transition"
            title="Compare differing viewpoints"
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Perspectives</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Summary */}
          {analysis && (
            <button
              onClick={handleCopySummary}
              className="p-1.5 rounded-DEFAULT text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant transition"
              title="Copy AI Summary"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Read Modal Trigger */}
          <button
            onClick={() => onOpenReader(article)}
            className="flex items-center gap-1.5 text-primary hover:text-on-primary hover:bg-primary px-3 py-1.5 rounded-DEFAULT border border-primary/30 font-label-sm font-bold text-xs transition shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Full Story</span>
          </button>

          {/* On-Demand AI Analyze Button */}
          {!analysis && (
            <button
              onClick={() => onAnalyzeArticle(article.id)}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary font-label-sm font-bold px-3 py-1.5 rounded-DEFAULT shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Summarize'}</span>
            </button>
          )}

          {/* Original Link */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container rounded-DEFAULT border border-outline-variant transition"
            title="Open original publication"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}