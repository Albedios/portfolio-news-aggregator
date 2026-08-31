import Parser from 'rss-parser';
import crypto from 'crypto';
import { Article, Feed } from '../types';
import { cleanHtmlContent, extractImageUrl } from './extractor';
import { generateContentHash, normalizeUrl } from './dedup';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'SmartNewsAggregator/1.0 (Mozilla/5.0 Compatible; RSS Reader)',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

export interface IngestionResult {
  feedId: string;
  feedTitle: string;
  articles: Article[];
  error?: string;
}

export async function fetchAndParseFeed(feed: Feed): Promise<IngestionResult> {
  try {
    const parsedFeed = await parser.parseURL(feed.url);
    const articles: Article[] = [];

    for (const item of parsedFeed.items || []) {
      const title = (item.title || 'Untitled Article').trim();
      const rawUrl = item.link || item.guid || '';
      if (!rawUrl) continue;

      const url = normalizeUrl(rawUrl);
      const anyItem = item as any;
      const author = (anyItem.creator || anyItem.author || anyItem['dc:creator'] || feed.title).trim();
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();

      const rawBody = anyItem.contentEncoded || item.content || item.summary || item.contentSnippet || '';
      const rawSummary = (item.contentSnippet || item.summary || '').slice(0, 400);
      const cleanedContent = cleanHtmlContent(rawBody || rawSummary || title);

      // Extract image
      const enclosureUrl = item.enclosure?.url;
      const mediaThumbnail = anyItem.mediaThumbnail?.$?.url;
      const mediaContent = Array.isArray(anyItem.mediaContent)
        ? anyItem.mediaContent[0]?.$?.url
        : anyItem.mediaContent?.$?.url;

      const imageUrl =
        enclosureUrl ||
        mediaThumbnail ||
        mediaContent ||
        extractImageUrl(rawBody);

      const contentHash = generateContentHash(title, cleanedContent, url);
      const articleId = `art-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      articles.push({
        id: articleId,
        feedId: feed.id,
        feedTitle: feed.title,
        title,
        url,
        author,
        publishedAt: new Date(publishedAt).toISOString(),
        rawSummary,
        cleanedContent: cleanedContent || title,
        contentHash,
        imageUrl,
      });
    }

    return {
      feedId: feed.id,
      feedTitle: feed.title,
      articles,
    };
  } catch (err: any) {
    console.error(`Failed to fetch feed ${feed.title} (${feed.url}):`, err.message);
    return {
      feedId: feed.id,
      feedTitle: feed.title,
      articles: [],
      error: err.message || 'Unknown error while parsing RSS feed',
    };
  }
}