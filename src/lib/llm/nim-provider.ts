import { ILLMProvider, LLMAnalysisInput, LLMAnalysisOutput, ANALYSIS_SYSTEM_PROMPT } from './types';

export class NIMProvider implements ILLMProvider {
  name = 'nim' as const;
  displayName = 'NVIDIA NIM';
  private apiKey: string;
  private model: string;
  private endpoint: string;

  constructor(
    apiKey: string,
    model: string = 'meta/llama-3.2-90b-vision-instruct',
    endpoint: string = 'https://integrate.api.nvidia.com/v1/chat/completions'
  ) {
    this.apiKey = apiKey;
    this.model = model || 'meta/llama-3.2-90b-vision-instruct';
    this.endpoint = endpoint;
  }

  async analyze(input: LLMAnalysisInput): Promise<LLMAnalysisOutput> {
    if (!this.apiKey) {
      throw new Error('NVIDIA NIM API key is required. Please set it in AI Studio or Settings.');
    }

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
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA NIM API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Empty response received from NVIDIA NIM API');
    }

    // Extract JSON cleanly in case the model wraps response in ```json ```
    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    try {
      const parsed: LLMAnalysisOutput = JSON.parse(jsonStr);
      return parsed;
    } catch (parseErr: any) {
      // Fallback: search for first { and last }
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const substring = jsonStr.slice(firstBrace, lastBrace + 1);
        const parsed: LLMAnalysisOutput = JSON.parse(substring);
        return parsed;
      }
      throw new Error(`Failed to parse NVIDIA NIM JSON output: ${parseErr.message}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return { success: false, message: 'NVIDIA NIM API key is missing. Please provide your nvapi key.' };
    }
    try {
      await this.analyze({
        title: 'Breakthrough in AI Accelerator Efficiency',
        content: 'Researchers and engineers have demonstrated next-generation tensor compute architectures with lower latency.',
      });
      return { success: true, message: `NVIDIA NIM connected successfully using ${this.model}!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to connect to NVIDIA NIM' };
    }
  }
}
