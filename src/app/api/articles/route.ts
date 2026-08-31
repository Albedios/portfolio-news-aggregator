import { NextRequest, NextResponse } from 'next/server';
import { getArticles } from '@/lib/db';
import { FilterOptions } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filter: FilterOptions = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      tone: searchParams.get('tone') || undefined,
      feedId: searchParams.get('feedId') || undefined,
      onlyAnalyzed: searchParams.get('onlyAnalyzed') === 'true',
      onlyBookmarked: searchParams.get('onlyBookmarked') === 'true',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '50', 10),
    };

    const minSentiment = searchParams.get('minSentiment');
    if (minSentiment !== null) filter.minSentiment = parseFloat(minSentiment);

    const maxSentiment = searchParams.get('maxSentiment');
    if (maxSentiment !== null) filter.maxSentiment = parseFloat(maxSentiment);

    const maxClickbait = searchParams.get('maxClickbait');
    if (maxClickbait !== null) filter.maxClickbait = parseInt(maxClickbait, 10);

    const result = getArticles(filter);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}