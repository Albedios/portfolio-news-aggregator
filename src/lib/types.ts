export type ToneLabel =
  | 'Analytical'
  | 'Alarmist'
  | 'Optimistic'
  | 'Critical'
  | 'Neutral'
  | 'Sensationalist';

export type FeedCategory =
  | 'All'
  | 'Tech'
  | 'World'
  | 'Science'
  | 'Business'
  | 'Finance'
  | 'Culture'
  | 'AI';

export type LLMProviderType = 'gemini' | 'openai' | 'ollama' | 'nim' | 'offline';

export interface Feed {
  id: string;
  title: string;
  url: string;
  siteUrl: string;
  category: FeedCategory;
  lastPolledAt: string | null;
  isActive: boolean;
  createdAt: string;
  articleCount?: number;
}

export interface ToneAnalysis {
  sentimentScore: number; // -1.0 (Extremely Negative) to 1.0 (Extremely Positive)
  toneLabel: ToneLabel;
  objectivityScore: number; // 0.0 to 1.0
  clickbaitRating: number; // 1 (Low) to 5 (Heavy Clickbait)
  cleanHeadline: string;
  emotionalTags: string[];
  perspectiveSummary?: string;
}

export interface ArticleAnalysis {
  id: string;
  articleId: string;
  providerUsed: LLMProviderType;
  modelName: string;
  tldr: string;
  bulletPoints: string[];
  tone: ToneAnalysis;
  category: string;
  readingTimeSeconds: number;
  processedAt: string;
}

export interface Article {
  id: string;
  feedId: string;
  feedTitle: string;
  title: string;
  url: string;
  author: string;
  publishedAt: string;
  rawSummary: string;
  cleanedContent: string;
  contentHash: string;
  imageUrl?: string;
  isBookmarked?: boolean;
  isRead?: boolean;
  analysis?: ArticleAnalysis;
}

export interface AppSettings {
  activeProvider: LLMProviderType;
  geminiApiKey: string;
  geminiModel: string;
  openaiApiKey: string;
  openaiModel: string;
  ollamaUrl: string;
  ollamaModel: string;
  nimApiKey: string;
  nimModel: string;
  autoAnalyzeOnIngest: boolean;
  pollingIntervalMinutes: number;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  tone?: string;
  minSentiment?: number;
  maxSentiment?: number;
  maxClickbait?: number;
  onlyAnalyzed?: boolean;
  onlyBookmarked?: boolean;
  feedId?: string;
  page?: number;
  limit?: number;
}

export interface AggregatorStats {
  totalFeeds: number;
  activeFeeds: number;
  totalArticles: number;
  analyzedArticles: number;
  bookmarkedArticles: number;
  averageSentiment: number;
  dominantTone: string;
  toneDistribution: Record<ToneLabel, number>;
  categoryDistribution: Record<string, number>;
  providerUsage: Record<string, number>;
}