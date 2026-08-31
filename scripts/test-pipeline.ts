import { getFeeds, saveArticles, getArticles, getStats, saveAnalysis } from "../src/lib/db";
import { fetchAndParseFeed } from "../src/lib/ingestion/rss-parser";
import { getLLMProvider } from "../src/lib/llm/factory";

async function main() {
  console.log("=== 1. Testing RSS Ingestion ===");
  const feeds = getFeeds();
  console.log("Registered feeds count:", feeds.length);

  const feed = feeds[0];
  console.log("Fetching feed:", feed.title, feed.url);
  const res = await fetchAndParseFeed(feed);
  console.log("Articles parsed:", res.articles.length, "Error:", res.error || "None");

  const { added, existing } = saveArticles(res.articles);
  console.log("DB Insert Result - Added:", added, "Existing:", existing);

  console.log("\n=== 2. Testing Tone & Sentiment Analysis ===");
  const sample = getArticles({ limit: 3 }).articles;
  const provider = getLLMProvider("offline");

  for (const article of sample) {
    console.log("\nArticle:", article.title);
    const out = await provider.analyze({
      title: article.title,
      content: article.cleanedContent,
      source: article.feedTitle,
    });
    console.log("  -> TL;DR:", out.tldr);
    console.log("  -> Sentiment Score:", out.tone.sentimentScore);
    console.log("  -> Tone Label:", out.tone.toneLabel);
    console.log("  -> Objectivity:", out.tone.objectivityScore);
    console.log("  -> Clickbait Rating:", out.tone.clickbaitRating);
    console.log("  -> Clean Headline:", out.tone.cleanHeadline);
    console.log("  -> Tags:", out.tone.emotionalTags.join(", "));

    saveAnalysis(article.id, {
      id: "ana-" + Date.now(),
      articleId: article.id,
      providerUsed: "offline",
      modelName: "Smart Offline NLP Engine",
      tldr: out.tldr,
      bulletPoints: out.bulletPoints,
      tone: out.tone,
      category: out.category,
      readingTimeSeconds: out.readingTimeSeconds,
      processedAt: new Date().toISOString(),
    });
  }

  console.log("\n=== 3. Testing Statistics ===");
  const stats = getStats();
  console.log("Total articles:", stats.totalArticles);
  console.log("Analyzed articles:", stats.analyzedArticles);
  console.log("Average sentiment:", stats.averageSentiment);
  console.log("Dominant tone:", stats.dominantTone);
  console.log("Tone distribution:", stats.toneDistribution);

  console.log("\n>>> TEST PASSED SUCCESSFULLY <<<");
}

main().catch(err => { console.error("Test Error:", err); process.exit(1); });