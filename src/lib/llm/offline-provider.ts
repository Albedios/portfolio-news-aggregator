import { ILLMProvider, LLMAnalysisInput, LLMAnalysisOutput } from './types';
import { ToneLabel } from '../types';

export class OfflineHeuristicProvider implements ILLMProvider {
  name = 'offline' as const;
  displayName = 'Smart Offline NLP Engine';

  private positiveWords = new Set([
    'breakthrough', 'success', 'growth', 'surge', 'gain', 'innovative', 'record', 'improve',
    'soar', 'boost', 'recovery', 'triumph', 'cure', 'win', 'milestone', 'advancement',
    'positive', 'bright', 'benefit', 'thrive', 'revolution', 'pioneering', 'peace', 'agreement'
  ]);

  private negativeWords = new Set([
    'crisis', 'crash', 'collapse', 'death', 'killed', 'war', 'plunge', 'disaster', 'threat',
    'danger', 'fear', 'risk', 'warning', 'catastrophe', 'drop', 'slump', 'scandal', 'lawsuit',
    'failure', 'chaos', 'recession', 'loss', 'struggle', 'fatal', 'arrest', 'breach'
  ]);

  private alarmistWords = new Set([
    'apocalypse', 'doomsday', 'existential', 'catastrophic', 'terrifying', 'nightmare',
    'brink', 'imminent', 'devastating', 'unprecedented', 'panic', 'shocks', 'horrific'
  ]);

  private clickbaitTriggers = [
    /you won'?t believe/i,
    /this one trick/i,
    /what happens next/i,
    /here'?s why/i,
    /shocking/i,
    /the secret to/i,
    /everyone is talking about/i,
    /will blow your mind/i,
    /!\s*$/i,
    /\?$/i,
  ];

  async analyze(input: LLMAnalysisInput): Promise<LLMAnalysisOutput> {
    const text = (input.title + ' ' + input.content).toLowerCase();
    const words = text.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);

    let posCount = 0;
    let negCount = 0;
    let alarmCount = 0;

    for (const w of words) {
      if (this.positiveWords.has(w)) posCount++;
      if (this.negativeWords.has(w)) negCount++;
      if (this.alarmistWords.has(w)) alarmCount++;
    }

    // Sentiment Calculation (-1.0 to 1.0)
    const totalSentimentWords = posCount + negCount;
    let sentimentScore = 0.0;
    if (totalSentimentWords > 0) {
      sentimentScore = parseFloat(((posCount - negCount) / Math.max(totalSentimentWords, 5)).toFixed(2));
      sentimentScore = Math.max(-1.0, Math.min(1.0, sentimentScore));
    }

    // Clickbait calculation (1 to 5)
    let clickbaitRating = 1;
    for (const trigger of this.clickbaitTriggers) {
      if (trigger.test(input.title)) clickbaitRating += 1;
    }
    if (input.title.toUpperCase() === input.title && input.title.length > 20) {
      clickbaitRating += 1;
    }
    clickbaitRating = Math.min(5, clickbaitRating);

    // Tone Classification
    let toneLabel: ToneLabel = 'Neutral';
    if (alarmCount >= 2 || (negCount >= 4 && sentimentScore <= -0.5)) {
      toneLabel = 'Alarmist';
    } else if (clickbaitRating >= 3) {
      toneLabel = 'Sensationalist';
    } else if (sentimentScore >= 0.3) {
      toneLabel = 'Optimistic';
    } else if (sentimentScore <= -0.3) {
      toneLabel = 'Critical';
    } else if (words.length > 150) {
      toneLabel = 'Analytical';
    }

    // Clean Headline
    let cleanHeadline = input.title
      .replace(/^(watch|look|revealed|breaking):\s*/i, '')
      .replace(/[!]+/g, '.')
      .replace(/\s+/g, ' ')
      .trim();

    // Sentences for summary
    const rawSentences = input.content
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30 && s.length < 250);

    const tldr = rawSentences.length > 0
      ? rawSentences[0]
      : (input.title + ' - Key developments reported from ' + (input.source || 'news sources') + '.');

    const bulletPoints = rawSentences.slice(1, 4);
    if (bulletPoints.length === 0) {
      bulletPoints.push(
        'Overview: ' + input.title,
        'Context: Reported by ' + (input.source || 'global media'),
        'Full details available in the original article.'
      );
    }

    // Emotional tags
    const emotionalTags: string[] = [];
    if (sentimentScore > 0.2) emotionalTags.push('Progress', 'Constructive');
    if (sentimentScore < -0.2) emotionalTags.push('High Stakes', 'Scrutiny');
    if (toneLabel === 'Analytical') emotionalTags.push('Data-Driven', 'Market Context');
    if (toneLabel === 'Alarmist') emotionalTags.push('Breaking Alert', 'Risk Factor');
    if (emotionalTags.length === 0) emotionalTags.push('General News', 'Factual');

    const readingTimeSeconds = Math.max(30, Math.round((words.length / 200) * 60));

    return {
      tldr,
      bulletPoints,
      tone: {
        sentimentScore,
        toneLabel,
        objectivityScore: parseFloat((Math.max(0.4, 1.0 - clickbaitRating * 0.15)).toFixed(2)),
        clickbaitRating,
        cleanHeadline,
        emotionalTags,
        perspectiveSummary: 'Evaluated with standard linguistic framing heuristics (' + toneLabel + ' tone detected).',
      },
      category: input.category || 'General',
      readingTimeSeconds,
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Offline NLP Heuristic Engine is active and operational.' };
  }
}
