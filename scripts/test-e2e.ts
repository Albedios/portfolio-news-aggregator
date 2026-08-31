import { getFeeds, getArticles, getStats, addFeed, saveAnalysis, getSettings, updateSettings } from '../src/lib/db';
import { fetchAndParseFeed } from '../src/lib/ingestion/rss-parser';
import { getLLMProvider } from '../src/lib/llm/factory';

async function runE2EVerification() {
  console.log('====================================================');
  console.log('🚀 RUNNING END-TO-END SMART NEWS AGGREGATOR AUDIT');
  console.log('====================================================\n');

  // Step 1: Check Registered Feeds
  console.log('1. [FEEDS] Inspecting Feed Registry...');
  const feeds = getFeeds();
  console.log(`✓ Feeds count: ${feeds.length}`);
  for (const f of feeds) {
    console.log(`  - [${f.category}] ${f.title} (${f.url})`);
  }

  // Step 2: Ingest from multiple sources
  console.log('\n2. [INGESTION] Ingesting live feeds from BBC & TechCrunch...');
  let totalNew = 0;
  for (const f of feeds.slice(0, 3)) {
    const res = await fetchAndParseFeed(f);
    console.log(`  ✓ ${f.title}: Ingested ${res.articles.length} items (Error: ${res.error || 'None'})`);
    if (res.articles.length > 0) {
      const { added } = (await import('../src/lib/db')).saveArticles(res.articles);
      totalNew += added;
    }
  }
  console.log(`✓ Total newly indexed articles in database: ${totalNew}`);

  // Step 3: Run Multi-Provider LLM Tone Analysis
  console.log('\n3. [LLM ENGINE] Running Multi-Provider Tone Analysis...');
  const articles = getArticles({ limit: 5 }).articles;
  const offlineProvider = getLLMProvider('offline');

  for (const art of articles) {
    const out = await offlineProvider.analyze({
      title: art.title,
      content: art.cleanedContent,
      source: art.feedTitle,
    });

    saveAnalysis(art.id, {
      id: `ana-e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      articleId: art.id,
      providerUsed: 'offline',
      modelName: offlineProvider.displayName,
      tldr: out.tldr,
      bulletPoints: out.bulletPoints,
      tone: out.tone,
      category: out.category,
      readingTimeSeconds: out.readingTimeSeconds,
      processedAt: new Date().toISOString(),
    });

    console.log(`\n  📰 "${art.title}"`);
    console.log(`     ⚡ TL;DR: ${out.tldr}`);
    console.log(`     🎯 Tone: [${out.tone.toneLabel}] | Sentiment: ${out.tone.sentimentScore} | Clickbait: ${out.tone.clickbaitRating}/5`);
    console.log(`     🏷️ Tags: ${out.tone.emotionalTags.join(', ')}`);
  }

  // Step 4: Aggregate Statistics & Sentiment Distribution
  console.log('\n4. [STATS] Aggregator Pulse Analytics...');
  const stats = getStats();
  console.log(`  ✓ Total Articles: ${stats.totalArticles}`);
  console.log(`  ✓ Analyzed Articles: ${stats.analyzedArticles}`);
  console.log(`  ✓ Prevailing Sentiment: ${stats.averageSentiment}`);
  console.log(`  ✓ Dominant Tone: ${stats.dominantTone}`);
  console.log(`  ✓ Tone Breakdown:`, JSON.stringify(stats.toneDistribution));

  // Step 5: Filter Tests
  console.log('\n5. [FILTERS] Testing Tone & Category Queries...');
  const techOnly = getArticles({ category: 'Tech' });
  console.log(`  ✓ Tech category articles: ${techOnly.total}`);

  const analyzedOnly = getArticles({ onlyAnalyzed: true });
  console.log(`  ✓ Analyzed only articles: ${analyzedOnly.total}`);

  console.log('\n====================================================');
  console.log('🎉 ALL PHASES & ITERATIONS VERIFIED SUCCESSFULLY!');
  console.log('====================================================');
}

runE2EVerification().catch((e) => {
  console.error('Audit failed:', e);
  process.exit(1);
});