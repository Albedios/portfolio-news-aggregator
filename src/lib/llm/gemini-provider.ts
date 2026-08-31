import { ILLMProvider, LLMAnalysisInput, LLMAnalysisOutput, ANALYSIS_SYSTEM_PROMPT } from './types';

export class GeminiProvider implements ILLMProvider {
  name = 'gemini' as const;
  displayName = 'Google Gemini (Flash)';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash') {
    this.apiKey = apiKey;
    this.model = model || 'gemini-2.0-flash';
  }

  async analyze(input: LLMAnalysisInput): Promise<LLMAnalysisOutput> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is required. Please set it in Settings.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const userPrompt = `Title: ${input.title}
Source: ${input.source || 'News Source'}
Category: ${input.category || 'General'}

Article Text:
${input.content.slice(0, 4000)}
`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: ANALYSIS_SYSTEM_PROMPT },
            { text: userPrompt },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) {
      throw new Error('Empty response received from Gemini API');
    }

    const parsed: LLMAnalysisOutput = JSON.parse(rawJson);
    return parsed;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return { success: false, message: 'Gemini API key is missing' };
    }
    try {
      await this.analyze({
        title: 'Tech Breakthrough in Clean Energy Announced',
        content: 'Scientists have achieved a new milestone in battery density, extending EV range by 50 percent.',
      });
      return { success: true, message: 'Gemini connection verified successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to connect to Gemini API' };
    }
  }
}
