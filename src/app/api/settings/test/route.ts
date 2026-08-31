import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/llm/factory';
import { LLMProviderType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, model, url } = body;

    const customSettings: any = {};
    if (provider === 'nim') {
      customSettings.nimApiKey = apiKey;
      if (model) customSettings.nimModel = model;
    } else if (provider === 'gemini') {
      customSettings.geminiApiKey = apiKey;
      if (model) customSettings.geminiModel = model;
    } else if (provider === 'openai') {
      customSettings.openaiApiKey = apiKey;
      if (model) customSettings.openaiModel = model;
    } else if (provider === 'ollama') {
      if (url) customSettings.ollamaUrl = url;
      if (model) customSettings.ollamaModel = model;
    }

    const llm = getLLMProvider(provider as LLMProviderType, customSettings);
    const result = await llm.testConnection();

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

