import { ILLMProvider, LLMAnalysisInput, LLMAnalysisOutput, ANALYSIS_SYSTEM_PROMPT } from './types';

export class OpenAIProvider implements ILLMProvider {
  name = 'openai' as const;
  displayName = 'OpenAI (ChatGPT)';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model || 'gpt-4o-mini';
  }

  async analyze(input: LLMAnalysisInput): Promise<LLMAnalysisOutput> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required. Please set it in Settings.');
    }

    const endpoint = 'https://api.openai.com/v1/chat/completions';

    const userPrompt = `Title: ${input.title}
Source: ${input.source || 'News Source'}
Category: ${input.category || 'General'}

Article Text:
${input.content.slice(0, 4000)}
`;

    const requestBody = {
      model: this.model,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawJson = data.choices?.[0]?.message?.content;
    if (!rawJson) {
      throw new Error('Empty response received from OpenAI API');
    }

    const parsed: LLMAnalysisOutput = JSON.parse(rawJson);
    return parsed;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return { success: false, message: 'OpenAI API key is missing' };
    }
    try {
      await this.analyze({
        title: 'Global Semiconductor Consortium Formed',
        content: 'Industry leaders have united to standardize AI chips and accelerate manufacturing efficiency.',
      });
      return { success: true, message: 'OpenAI connection verified successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to connect to OpenAI API' };
    }
  }
}
