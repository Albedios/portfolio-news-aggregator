import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, saveAnalysis } from '@/lib/db';
import { getLLMProvider } from '@/lib/llm/factory';
import crypto from 'crypto';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const overrideProvider = body.provider;

    const article = getArticleById(id);
    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const provider = getLLMProvider(overrideProvider);

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

    const updatedArticle = saveAnalysis(article.id, analysis);

    return NextResponse.json({
      success: true,
      analysis,
      article: updatedArticle,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
