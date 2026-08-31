import { AppSettings, LLMProviderType } from '../types';
import { getSettings } from '../db';
import { ILLMProvider } from './types';
import { OfflineHeuristicProvider } from './offline-provider';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { OllamaProvider } from './ollama-provider';
import { NIMProvider } from './nim-provider';

export function getLLMProvider(overrideProvider?: LLMProviderType, customSettings?: Partial<AppSettings>): ILLMProvider {
  const settings = { ...getSettings(), ...(customSettings || {}) };
  const providerType = overrideProvider || settings.activeProvider;

  switch (providerType) {
    case 'nim':
      return new NIMProvider(settings.nimApiKey, settings.nimModel);
    case 'gemini':
      return new GeminiProvider(settings.geminiApiKey, settings.geminiModel);
    case 'openai':
      return new OpenAIProvider(settings.openaiApiKey, settings.openaiModel);
    case 'ollama':
      return new OllamaProvider(settings.ollamaUrl, settings.ollamaModel);
    case 'offline':
    default:
      return new OfflineHeuristicProvider();
  }
}

