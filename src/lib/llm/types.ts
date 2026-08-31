import { ToneAnalysis, ToneLabel, LLMProviderType } from '../types';

export interface LLMAnalysisInput {
  title: string;
  content: string;
  source?: string;
  category?: string;
}

export interface LLMAnalysisOutput {
  tldr: string;
  bulletPoints: string[];
  tone: ToneAnalysis;
  category: string;
  readingTimeSeconds: number;
}

export interface ILLMProvider {
  name: LLMProviderType;
  displayName: string;
  analyze(input: LLMAnalysisInput): Promise<LLMAnalysisOutput>;
  testConnection(): Promise<{ success: boolean; message: string }>;
}

export const ANALYSIS_SYSTEM_PROMPT = `You are an elite news analyst and media objectivity auditor.
Analyze the provided news article and output a strictly valid JSON object conforming exactly to this structure:

{
  "tldr": "A clear, high-impact 1-2 sentence executive summary of what happened.",
  "bulletPoints": [
    "Key factual takeaway 1",
    "Key factual takeaway 2",
    "Key factual takeaway 3"
  ],
  "tone": {
    "sentimentScore": 0.0, // float between -1.0 (extremely negative/disastrous) and 1.0 (extremely positive/breakthrough)
    "toneLabel": "Analytical", // Must be EXACTLY ONE of: "Analytical" | "Alarmist" | "Optimistic" | "Critical" | "Neutral" | "Sensationalist"
    "objectivityScore": 0.85, // float between 0.0 (pure opinion/editorial bias) and 1.0 (strictly factual reporting)
    "clickbaitRating": 1, // integer between 1 (clean, informative) and 5 (extreme clickbait/hyperbole)
    "cleanHeadline": "A clean, factual, non-sensational rewrite of the headline",
    "emotionalTags": ["Tag1", "Tag2", "Tag3"],
    "perspectiveSummary": "Brief note on perspective, framing, or potential biases detected"
  },
  "category": "Tech", // Main category (e.g. Tech, World, Science, Business, AI)
  "readingTimeSeconds": 90
}

Ensure all scores are calibrated accurately. Do not include markdown code blocks or any extraneous text outside the JSON object.`;
