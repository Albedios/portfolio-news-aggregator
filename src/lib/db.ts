import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Feed,
  Article,
  ArticleAnalysis,
  AppSettings,
  FilterOptions,
  AggregatorStats,
  ToneLabel,
} from './types';
import { DEFAULT_FEEDS, DEFAULT_SETTINGS } from './constants';

interface DatabaseSchema {
  feeds: Feed[];
  articles: Article[];
  settings: AppSettings;
  bookmarks: string[]; // article IDs
  readArticleIds: string[];
  version: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'news_aggregator.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initDefaultDatabase(): DatabaseSchema {
  const initialFeeds: Feed[] = DEFAULT_FEEDS.map((f, idx) => ({
    id: `feed-${idx + 1}-${crypto.randomBytes(4).toString('hex')}`,
    ...f,
    lastPolledAt: null,
    createdAt: new Date().toISOString(),
  }));

  return {
    feeds: initialFeeds,
    articles: [],
    settings: DEFAULT_SETTINGS,
    bookmarks: [],
    readArticleIds: [],
    version: 1,
  };
}

let memoryCache: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  ensureDataDir();

  if (!fs.existsSync(DB_FILE)) {
    const initialDb = initDefaultDatabase();
    saveDatabase(initialDb);
    memoryCache = initialDb;
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.bookmarks) parsed.bookmarks = [];
    if (!parsed.readArticleIds) parsed.readArticleIds = [];
    memoryCache = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading database file, initializing fresh:', err);
    const fallback = initDefaultDatabase();
    saveDatabase(fallback);
    memoryCache = fallback;
    return fallback;
  }
}

export function saveDatabase(db: DatabaseSchema): void {
  ensureDataDir();
  memoryCache = db;

  const tempFile = `${DB_FILE}.tmp-${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf8');
  try {
    fs.renameSync(tempFile, DB_FILE);
  } catch {
    fs.copyFileSync(tempFile, DB_FILE);
    fs.unlinkSync(tempFile);
  }
}

// Feeds operations
export function getFeeds(): Feed[] {
  const db = getDatabase();
  const articleCounts = db.articles.reduce<Record<string, number>>((acc, art) => {
    acc[art.feedId] = (acc[art.feedId] || 0) + 1;
    return acc;
  }, {});

  return db.feeds.map((f) => ({
    ...f,
    articleCount: articleCounts[f.id] || 0,
  }));
}

export function getFeedById(id: string): Feed | undefined {
  const feeds = getFeeds();
  return feeds.find((f) => f.id === id);
}

export function addFeed(feedInput: Omit<Feed, 'id' | 'createdAt' | 'lastPolledAt' | 'articleCount'>): Feed {
  const db = getDatabase();
  const newFeed: Feed = {
    id: `feed-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    ...feedInput,
    lastPolledAt: null,
    createdAt: new Date().toISOString(),
  };

  db.feeds.push(newFeed);
  saveDatabase(db);
  return newFeed;
}

export function updateFeed(id: string, updates: Partial<Feed>): Feed | null {
  const db = getDatabase();
  const index = db.feeds.findIndex((f) => f.id === id);
  if (index === -1) return null;

  db.feeds[index] = {
    ...db.feeds[index],
    ...updates,
  };
  saveDatabase(db);
  return db.feeds[index];
}

export function deleteFeed(id: string): boolean {
  const db = getDatabase();
  const initialLength = db.feeds.length;
  db.feeds = db.feeds.filter((f) => f.id !== id);
  db.articles = db.articles.filter((a) => a.feedId !== id);

  if (db.feeds.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// Articles operations
export function getArticles(filter: FilterOptions = {}): { articles: Article[]; total: number; page: number; limit: number } {
  const db = getDatabase();
  const bookmarkSet = new Set(db.bookmarks || []);
  const readSet = new Set(db.readArticleIds || []);

  let list = db.articles.map((a) => ({
    ...a,
    isBookmarked: bookmarkSet.has(a.id),
    isRead: readSet.has(a.id),
  }));

  // Search in title, rawSummary, cleanedContent, or analysis TLDR
  if (filter.search && filter.search.trim() !== '') {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.rawSummary.toLowerCase().includes(q) ||
        (a.analysis && a.analysis.tldr.toLowerCase().includes(q)) ||
        (a.analysis && a.analysis.tone.emotionalTags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  // Category filter
  if (filter.category && filter.category !== 'All') {
    const matchingFeedIds = new Set(
      db.feeds.filter((f) => f.category === filter.category).map((f) => f.id)
    );
    list = list.filter((a) => matchingFeedIds.has(a.feedId));
  }

  // Feed filter
  if (filter.feedId && filter.feedId !== 'All') {
    list = list.filter((a) => a.feedId === filter.feedId);
  }

  // Bookmarked only filter
  if (filter.onlyBookmarked) {
    list = list.filter((a) => a.isBookmarked);
  }

  // Analyzed filter
  if (filter.onlyAnalyzed) {
    list = list.filter((a) => a.analysis !== undefined);
  }

  // Tone filter
  if (filter.tone && filter.tone !== 'All') {
    list = list.filter((a) => a.analysis?.tone.toneLabel === filter.tone);
  }

  // Sentiment range filter
  if (filter.minSentiment !== undefined || filter.maxSentiment !== undefined) {
    const min = filter.minSentiment ?? -1.0;
    const max = filter.maxSentiment ?? 1.0;
    list = list.filter((a) => {
      if (!a.analysis) return true;
      const s = a.analysis.tone.sentimentScore;
      return s >= min && s <= max;
    });
  }

  // Clickbait rating filter
  if (filter.maxClickbait !== undefined) {
    list = list.filter((a) => {
      if (!a.analysis) return true;
      return a.analysis.tone.clickbaitRating <= (filter.maxClickbait ?? 5);
    });
  }

  // Sort by publishedAt descending
  list.sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime() || 0;
    const dateB = new Date(b.publishedAt).getTime() || 0;
    return dateB - dateA;
  });

  const total = list.length;
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const startIndex = (page - 1) * limit;
  const paginatedArticles = list.slice(startIndex, startIndex + limit);

  return {
    articles: paginatedArticles,
    total,
    page,
    limit,
  };
}

export function getArticleById(id: string): Article | undefined {
  const db = getDatabase();
  const article = db.articles.find((a) => a.id === id);
  if (!article) return undefined;

  const bookmarkSet = new Set(db.bookmarks || []);
  const readSet = new Set(db.readArticleIds || []);
  return {
    ...article,
    isBookmarked: bookmarkSet.has(article.id),
    isRead: readSet.has(article.id),
  };
}

export function saveArticles(newArticles: Article[]): { added: number; existing: number } {
  const db = getDatabase();
  const existingHashes = new Set(db.articles.map((a) => a.contentHash));
  const existingUrls = new Set(db.articles.map((a) => a.url));

  let added = 0;
  let existing = 0;

  for (const art of newArticles) {
    if (existingHashes.has(art.contentHash) || existingUrls.has(art.url)) {
      existing++;
      continue;
    }

    db.articles.push(art);
    existingHashes.add(art.contentHash);
    existingUrls.add(art.url);
    added++;
  }

  if (added > 0) {
    saveDatabase(db);
  }

  return { added, existing };
}

export function saveAnalysis(articleId: string, analysis: ArticleAnalysis): Article | null {
  const db = getDatabase();
  const index = db.articles.findIndex((a) => a.id === articleId);
  if (index === -1) return null;

  db.articles[index].analysis = analysis;
  saveDatabase(db);
  return db.articles[index];
}

export function toggleBookmark(articleId: string): boolean {
  const db = getDatabase();
  if (!db.bookmarks) db.bookmarks = [];

  const index = db.bookmarks.indexOf(articleId);
  let isBookmarked = false;
  if (index >= 0) {
    db.bookmarks.splice(index, 1);
    isBookmarked = false;
  } else {
    db.bookmarks.push(articleId);
    isBookmarked = true;
  }

  saveDatabase(db);
  return isBookmarked;
}

export function markAsRead(articleId: string): void {
  const db = getDatabase();
  if (!db.readArticleIds) db.readArticleIds = [];
  if (!db.readArticleIds.includes(articleId)) {
    db.readArticleIds.push(articleId);
    saveDatabase(db);
  }
}

// Settings operations
export function getSettings(): AppSettings {
  const db = getDatabase();
  return { ...DEFAULT_SETTINGS, ...db.settings };
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const db = getDatabase();
  db.settings = {
    ...db.settings,
    ...updates,
  };
  saveDatabase(db);
  return db.settings;
}

// Aggregator Statistics
export function getStats(): AggregatorStats {
  const db = getDatabase();
  const totalFeeds = db.feeds.length;
  const activeFeeds = db.feeds.filter((f) => f.isActive).length;
  const totalArticles = db.articles.length;
  const analyzedArticles = db.articles.filter((a) => a.analysis !== undefined).length;
  const bookmarkedArticles = (db.bookmarks || []).length;

  const toneDistribution: Record<ToneLabel, number> = {
    Analytical: 0,
    Optimistic: 0,
    Critical: 0,
    Alarmist: 0,
    Neutral: 0,
    Sensationalist: 0,
  };

  const categoryDistribution: Record<string, number> = {};
  const providerUsage: Record<string, number> = {};
  let totalSentiment = 0;
  let sentimentCount = 0;

  for (const art of db.articles) {
    const feed = db.feeds.find((f) => f.id === art.feedId);
    const category = feed ? feed.category : 'General';
    categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;

    if (art.analysis) {
      const tone = art.analysis.tone.toneLabel;
      if (toneDistribution[tone] !== undefined) {
        toneDistribution[tone]++;
      }
      totalSentiment += art.analysis.tone.sentimentScore;
      sentimentCount++;

      const prov = art.analysis.providerUsed;
      providerUsage[prov] = (providerUsage[prov] || 0) + 1;
    }
  }

  const averageSentiment = sentimentCount > 0 ? parseFloat((totalSentiment / sentimentCount).toFixed(2)) : 0;

  let maxCount = -1;
  let dominantTone = 'Neutral';
  for (const [tone, count] of Object.entries(toneDistribution)) {
    if (count > maxCount && count > 0) {
      maxCount = count;
      dominantTone = tone;
    }
  }

  return {
    totalFeeds,
    activeFeeds,
    totalArticles,
    analyzedArticles,
    bookmarkedArticles,
    averageSentiment,
    dominantTone,
    toneDistribution,
    categoryDistribution,
    providerUsage,
  };
}

// Perspective Matrix - Find related articles with contrasting tones
export function getRelatedPerspectives(targetArticleId: string): { mainArticle: Article; relatedArticles: Article[] } | null {
  const db = getDatabase();
  const mainArticle = db.articles.find((a) => a.id === targetArticleId);
  if (!mainArticle) return null;

  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'is', 'are', 'was', 'were', 'it', 'its', 'from', 'have', 'has', 'that', 'this']);
  const titleWords = mainArticle.title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  if (titleWords.length === 0) {
    return { mainArticle, relatedArticles: [] };
  }

  const related = db.articles
    .filter((a) => a.id !== targetArticleId)
    .map((a) => {
      const aTitleWords = a.title.toLowerCase().split(/\s+/);
      const matchCount = titleWords.filter((w) => aTitleWords.some((aw) => aw.includes(w))).length;
      return { article: a, score: matchCount };
    })
    .filter((item) => item.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.article);

  return {
    mainArticle,
    relatedArticles: related,
  };
}