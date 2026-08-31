import { ILLMProvider, LLMAnalysisInput, LLMAnalysisOutput, ANALYSIS_SYSTEM_PROMPT } from './types';

export class OllamaProvider implements ILLMProvider {
  name = 'ollama' as const;
  displayName = 'Local Ollama Instance';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3.2:latest') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model || 'llama3.2:latest';
  }

  async analyze(input: LLMAnalysisInput): Promise<LLMAnalysisOutput> {
    const endpoint = `${this.baseUrl}/api/generate`;

    const prompt = `${ANALYSIS_SYSTEM_PROMPT}

Title: ${input.title}
Source: ${input.source || 'News Source'}
Category: ${input.category || 'General'}

Article Text:
${input.content.slice(0, 3000)}

Respond with ONLY the JSON object.`;

    const requestBody = {
      model: this.model,
      prompt,
      format: 'json',
      stream: false,
      options: {
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
      throw new Error(`Ollama API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawJson = data.response;
    if (!rawJson) {
      throw new Error('Empty response received from Ollama');
    }

    const parsed: LLMAnalysisOutput = JSON.parse(rawJson);
    return parsed;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const tagsRes = await fetch(`${this.baseUrl}/api/tags`);
      if (!tagsRes.ok) {
        return { success: false, message: `Ollama server responded with status ${tagsRes.status}` };
      }
      const data = await tagsRes.json();
      const models = (data.models || []).map((m: any) => m.name);
      return {
        success: true,
        message: `Connected to Ollama! Available models: ${models.join(', ') || 'None found'}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Could not connect to Ollama at ${this.baseUrl}: ${err.message}`,
      };
    }
  }
}
