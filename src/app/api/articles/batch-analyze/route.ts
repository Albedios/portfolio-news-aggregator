import { NextRequest, NextResponse } from 'next/server';
import { getArticles, saveAnalysis } from '@/lib/db';
import { getLLMProvider } from '@/lib/llm/factory';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 10;
    const overrideProvider = body.provider;

    const unanalyzed = getArticles({ onlyAnalyzed: false, limit: 100 }).articles
      .filter((a) => !a.analysis)
      .slice(0, limit);

    if (unanalyzed.length === 0) {
      return NextResponse.json({ success: true, message: 'No unanalyzed articles found', count: 0 });
    }

    const provider = getLLMProvider(overrideProvider);
    let successCount = 0;
    const errors: string[] = [];

    for (const article of unanalyzed) {
      try {
        const out = await provider.analyze({
          title: article.title,
          content: article.cleanedContent || article.rawSummary || article.title,
          source: article.feedTitle,
        });

        const analysis = {
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
        };

        saveAnalysis(article.id, analysis);
        successCount++;
      } catch (err: any) {
        errors.push(`Failed on "${article.title}": ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed: successCount,
      totalRequested: unanalyzed.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
