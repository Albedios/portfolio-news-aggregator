import { NextRequest, NextResponse } from 'next/server';
import { getFeeds, addFeed } from '@/lib/db';
import { fetchAndParseFeed } from '@/lib/ingestion/rss-parser';

export async function GET() {
  try {
    const feeds = getFeeds();
    return NextResponse.json({ success: true, feeds });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, url, siteUrl, category } = body;

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ success: false, error: 'Valid RSS URL is required' }, { status: 400 });
    }

    // Validate feed by attempting a test fetch
    const tempFeed = {
      id: 'temp-test',
      title: title || 'New Feed',
      url,
      siteUrl: siteUrl || url,
      category: category || 'Tech',
      isActive: true,
      lastPolledAt: null,
      createdAt: new Date().toISOString(),
    };

    const testResult = await fetchAndParseFeed(tempFeed);
    if (testResult.error && testResult.articles.length === 0) {
      return NextResponse.json(
        { success: false, error: `Could not parse RSS feed: ${testResult.error}` },
        { status: 400 }
      );
    }

    const feed = addFeed({
      title: title || testResult.feedTitle || 'New Custom Feed',
      url,
      siteUrl: siteUrl || url,
      category: category || 'Tech',
      isActive: true,
    });

    return NextResponse.json({ success: true, feed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
