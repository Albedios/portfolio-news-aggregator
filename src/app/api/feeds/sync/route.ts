import { NextRequest, NextResponse } from 'next/server';
import { getFeeds, updateFeed, saveArticles, getSettings, saveAnalysis, getArticles } from '@/lib/db';
import { fetchAndParseFeed } from '@/lib/ingestion/rss-parser';
import { getLLMProvider } from '@/lib/llm/factory';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetFeedId = body.feedId;

    const feeds = getFeeds().filter((f) => f.isActive && (!targetFeedId || f.id === targetFeedId));

    let totalNewArticles = 0;
    const syncResults = [];

    for (const feed of feeds) {
      const result = await fetchAndParseFeed(feed);
      if (result.articles.length > 0) {
        const { added } = saveArticles(result.articles);
        totalNewArticles += added;
        syncResults.push({
          feedId: feed.id,
          feedTitle: feed.title,
          found: result.articles.length,
          added,
        });
      } else {
        syncResults.push({
          feedId: feed.id,
          feedTitle: feed.title,
          found: 0,
          added: 0,
          error: result.error,
        });
      }
      updateFeed(feed.id, { lastPolledAt: new Date().toISOString() });
    }

    // Auto-analyze newly ingested articles if enabled in settings
    const settings = getSettings();
    if (settings.autoAnalyzeOnIngest && totalNewArticles > 0) {
      const provider = getLLMProvider();
      const unanalyzed = getArticles({ onlyAnalyzed: false, limit: 10 }).articles.filter((a) => !a.analysis);

      for (const article of unanalyzed) {
        try {
          const out = await provider.analyze({
            title: article.title,
            content: article.cleanedContent,
            source: article.feedTitle,
          });
          saveAnalysis(article.id, {
            id: `ana-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
            articleId: article.id,
            providerUsed: provider.name,
            modelName: provider.displayName,
            tldr: out.tldr,
            bulletPoints: out.bulletPoints,
            tone: out.tone,
            category: out.category,
            readingTimeSeconds: out.readingTimeSeconds,
            processedAt: new Date().toISOString(),
          });
        } catch (analysisErr) {
          console.error(`Auto-analysis error for ${article.title}:`, analysisErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalNewArticles,
      feedsProcessed: feeds.length,
      details: syncResults,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
