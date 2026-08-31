import { Feed, AppSettings, FeedCategory } from './types';

export const DEFAULT_FEEDS: Omit<Feed, 'id' | 'createdAt' | 'lastPolledAt'>[] = [
  {
    title: 'Hacker News Frontpage',
    url: 'https://news.ycombinator.com/rss',
    siteUrl: 'https://news.ycombinator.com',
    category: 'Tech',
    isActive: true,
  },
  {
    title: 'BBC World News',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    siteUrl: 'https://www.bbc.com/news/world',
    category: 'World',
    isActive: true,
  },
  {
    title: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    siteUrl: 'https://arstechnica.com',
    category: 'Tech',
    isActive: true,
  },
  {
    title: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    siteUrl: 'https://techcrunch.com',
    category: 'Tech',
    isActive: true,
  },
  {
    title: 'ScienceDaily - Top Science',
    url: 'https://www.sciencedaily.com/rss/top/science.xml',
    siteUrl: 'https://www.sciencedaily.com',
    category: 'Science',
    isActive: true,
  },
  {
    title: 'MIT Technology Review - AI',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    siteUrl: 'https://www.technologyreview.com',
    category: 'AI',
    isActive: true,
  },
  {
    title: 'CNBC Top News',
    url: 'https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=rss',
    siteUrl: 'https://www.cnbc.com',
    category: 'Business',
    isActive: true,
  }
];

export const PRESET_DISCOVER_FEEDS: { title: string; url: string; siteUrl: string; category: FeedCategory; desc: string }[] = [
  {
    title: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    siteUrl: 'https://www.theverge.com',
    category: 'Tech',
    desc: 'Covering gadgets, culture, and high-tech policy developments.',
  },
  {
    title: 'Wired Top Stories',
    url: 'https://www.wired.com/feed/rss',
    siteUrl: 'https://www.wired.com',
    category: 'Tech',
    desc: 'Deep dives on cyber security, artificial intelligence, and culture.',
  },
  {
    title: 'Nature Magazine News',
    url: 'https://www.nature.com/nature.rss',
    siteUrl: 'https://www.nature.com',
    category: 'Science',
    desc: 'Leading peer-reviewed international scientific discoveries.',
  },
  {
    title: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    siteUrl: 'https://venturebeat.com',
    category: 'AI',
    desc: 'Enterprise AI strategies, LLM benchmarks, and machine learning.',
  },
  {
    title: 'Reuters Business',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
    siteUrl: 'https://www.reuters.com',
    category: 'Business',
    desc: 'Global markets, macroeconomic forecasting, and industry trends.',
  },
  {
    title: 'NPR World News',
    url: 'https://feeds.npr.org/1004/rss.xml',
    siteUrl: 'https://www.npr.org',
    category: 'World',
    desc: 'In-depth global reporting, human interest, and geopolitical events.',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  activeProvider: 'nim',
  nimApiKey: '',
  nimModel: 'meta/llama-3.2-90b-vision-instruct',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2:latest',
  autoAnalyzeOnIngest: true,
  pollingIntervalMinutes: 15,
};

export const TONE_COLORS: Record<string, { bg: string; text: string; border: string; badge: string; icon: string; shadow: string }> = {
  Analytical: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    shadow: 'shadow-blue-500/10',
    icon: '📊',
  },
  Optimistic: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shadow: 'shadow-emerald-500/10',
    icon: '🌱',
  },
  Critical: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    shadow: 'shadow-purple-500/10',
    icon: '⚖️',
  },
  Alarmist: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-50 text-red-700 border-red-200',
    shadow: 'shadow-red-500/10',
    icon: '🚨',
  },
  Neutral: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    shadow: 'shadow-slate-500/10',
    icon: '⚪',
  },
  Sensationalist: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    shadow: 'shadow-amber-500/10',
    icon: '🔥',
  },
};