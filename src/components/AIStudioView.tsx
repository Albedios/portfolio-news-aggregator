'use client';

import React, { useState } from 'react';
import { AppSettings, LLMProviderType } from '@/lib/types';
import {
  Cpu,
  Sparkles,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Zap,
  Sliders,
  ExternalLink,
  Activity,
  Layers,
  Terminal,
} from 'lucide-react';

interface AIStudioViewProps {
  settings: AppSettings | null;
  onSaveSettings: (updated: Partial<AppSettings>) => Promise<void>;
}

export function AIStudioView({ settings, onSaveSettings }: AIStudioViewProps) {
  const [activeProvider, setActiveProvider] = useState<LLMProviderType>(
    settings?.activeProvider || 'nim'
  );
  const [nimApiKey, setNimApiKey] = useState(settings?.nimApiKey || '');
  const [nimModel, setNimModel] = useState(settings?.nimModel || 'meta/llama-3.3-70b-instruct');
  const [geminiApiKey, setGeminiApiKey] = useState(settings?.geminiApiKey || '');
  const [geminiModel, setGeminiModel] = useState(settings?.geminiModel || 'gemini-2.0-flash');
  const [openaiApiKey, setOpenaiApiKey] = useState(settings?.openaiApiKey || '');
  const [openaiModel, setOpenaiModel] = useState(settings?.openaiModel || 'gpt-4o-mini');
  const [ollamaUrl, setOllamaUrl] = useState(settings?.ollamaUrl || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(settings?.ollamaModel || 'llama3.2:latest');
  const [autoAnalyze, setAutoAnalyze] = useState(settings?.autoAnalyzeOnIngest ?? true);

  // Depth preset
  const [summaryDepth, setSummaryDepth] = useState<'fast' | 'balanced' | 'deep'>('balanced');

  const [showNimKey, setShowNimKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const payload = {
        provider: activeProvider,
        apiKey:
          activeProvider === 'nim'
            ? nimApiKey
            : activeProvider === 'gemini'
            ? geminiApiKey
            : openaiApiKey,
        model:
          activeProvider === 'nim'
            ? nimModel
            : activeProvider === 'gemini'
            ? geminiModel
            : activeProvider === 'openai'
            ? openaiModel
            : ollamaModel,
        url: ollamaUrl,
      };

      const res = await fetch('/api/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveSettings({
      activeProvider,
      nimApiKey,
      nimModel,
      geminiApiKey,
      geminiModel,
      openaiApiKey,
      openaiModel,
      ollamaUrl,
      ollamaModel,
      autoAnalyzeOnIngest: autoAnalyze,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-on-surface">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Cpu className="w-4 h-4" />
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider">
              AI Engine &amp; Synthesis Configuration
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
            AI Studio &amp; Preferences
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
            Configure NVIDIA NIM, Gemini, OpenAI, or Ollama to power executive summaries, tone audits, and news intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-DEFAULT bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant text-xs font-label-sm font-bold transition disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-primary' : 'text-emerald-600'}`} />
            <span>{isTesting ? 'Testing Connectivity...' : 'Test Connection'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-DEFAULT bg-primary hover:bg-primary-container text-on-primary text-xs font-label-sm font-bold shadow-sm transition disabled:opacity-50"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {/* Test Connection Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs font-label-sm font-medium flex items-center justify-between animate-slide-up ${
            testResult.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{testResult.message}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-on-surface-variant hover:text-on-surface p-1">
            ✕
          </button>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Primary Engine Selection */}
        <section className="lg:col-span-12 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Active LLM Architecture</h3>
                <p className="font-body-md text-xs text-on-surface-variant">Select your preferred inference provider</p>
              </div>
            </div>
            <span className="text-[11px] font-label-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Live Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            {/* NVIDIA NIM */}
            <div
              onClick={() => setActiveProvider('nim')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                activeProvider === 'nim'
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                  : 'bg-surface border-outline-variant hover:border-emerald-500/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 font-label-sm">
                    <Zap className="w-4 h-4" />
                    <span>NVIDIA NIM</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Enterprise
                  </span>
                </div>
                <h4 className="font-headline font-bold text-base text-on-surface">NVIDIA NIM Cloud</h4>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  High-throughput GPU inference with Llama 3.2 90B, Nemotron, or DeepSeek via NVIDIA NIM.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs font-label-sm">
                <span className="text-on-surface-variant font-mono truncate max-w-[120px]">{nimModel.split('/')[1] || nimModel}</span>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeProvider === 'nim' ? 'border-emerald-600 bg-emerald-600' : 'border-outline'}`}>
                  {activeProvider === 'nim' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </div>

            {/* Google Gemini */}
            <div
              onClick={() => setActiveProvider('gemini')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeProvider === 'gemini'
                  ? 'bg-primary-container/10 border-primary shadow-sm ring-1 ring-primary'
                  : 'bg-surface border-outline-variant hover:border-primary/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary font-label-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Google AI</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary/30">
                    Fast
                  </span>
                </div>
                <h4 className="font-headline font-bold text-base text-on-surface">Gemini 2.0 Flash</h4>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  Low latency, multimodal reasoning, and structured JSON synthesis.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs font-label-sm">
                <span className="text-on-surface-variant font-mono">gemini-2.0-flash</span>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeProvider === 'gemini' ? 'border-primary bg-primary' : 'border-outline'}`}>
                  {activeProvider === 'gemini' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </div>

            {/* OpenAI */}
            <div
              onClick={() => setActiveProvider('openai')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeProvider === 'openai'
                  ? 'bg-secondary-container/10 border-secondary shadow-sm ring-1 ring-secondary'
                  : 'bg-surface border-outline-variant hover:border-secondary/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-secondary font-label-sm">
                    <Bot className="w-4 h-4" />
                    <span>OpenAI</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed">
                    Balanced
                  </span>
                </div>
                <h4 className="font-headline font-bold text-base text-on-surface">GPT-4o Mini</h4>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  Cost-efficient, sharp editorial classification, and perspective analysis.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs font-label-sm">
                <span className="text-on-surface-variant font-mono">gpt-4o-mini</span>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeProvider === 'openai' ? 'border-secondary bg-secondary' : 'border-outline'}`}>
                  {activeProvider === 'openai' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </div>

            {/* Local Ollama */}
            <div
              onClick={() => setActiveProvider('ollama')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeProvider === 'ollama'
                  ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-surface border-outline-variant hover:border-amber-500/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 font-label-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Self-Hosted</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    100% Private
                  </span>
                </div>
                <h4 className="font-headline font-bold text-base text-on-surface">Local Ollama</h4>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  Run Llama 3.2 or Mistral locally on your GPU/CPU with zero external cloud calls.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs font-label-sm">
                <span className="text-on-surface-variant font-mono truncate max-w-[100px]">{ollamaModel}</span>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeProvider === 'ollama' ? 'border-amber-600 bg-amber-600' : 'border-outline'}`}>
                  {activeProvider === 'ollama' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </div>

            {/* Offline NLP */}
            <div
              onClick={() => setActiveProvider('offline')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeProvider === 'offline'
                  ? 'bg-surface-container border-outline shadow-sm ring-1 ring-outline'
                  : 'bg-surface border-outline-variant hover:border-outline'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface font-label-sm">
                    <Zap className="w-4 h-4" />
                    <span>Rule-Based</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-high text-on-surface">
                    Instant
                  </span>
                </div>
                <h4 className="font-headline font-bold text-base text-on-surface">Offline NLP</h4>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  Zero external keys required. Uses heuristic summarization and lexicon.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs font-label-sm">
                <span className="text-on-surface-variant font-mono">native-lexicon</span>
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeProvider === 'offline' ? 'border-primary bg-primary' : 'border-outline'}`}>
                  {activeProvider === 'offline' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Synthesis Mode & Depth */}
        <section className="lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <Sliders className="w-5 h-5 text-secondary" />
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Summary Depth &amp; Format</h3>
              <p className="font-body-md text-xs text-on-surface-variant">Control granularity and reading time</p>
            </div>
          </div>

          <div className="space-y-3">
            <label
              onClick={() => setSummaryDepth('fast')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                summaryDepth === 'fast'
                  ? 'bg-primary-container/10 border-primary text-on-surface'
                  : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary/50'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-label-sm">Fast TL;DR Mode</div>
                <div className="text-[11px] text-on-surface-variant font-body-md">1-sentence ultra-condensed headline takeaway</div>
              </div>
              <span className="text-xs font-mono font-bold text-on-surface-variant">~15 sec read</span>
            </label>

            <label
              onClick={() => setSummaryDepth('balanced')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                summaryDepth === 'balanced'
                  ? 'bg-primary-container/10 border-primary text-on-surface'
                  : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary/50'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-label-sm">Balanced Briefing (Default)</div>
                <div className="text-[11px] text-on-surface-variant font-body-md">Executive synopsis + 3 key bullet points + tone analysis</div>
              </div>
              <span className="text-xs font-mono font-bold text-primary">~45 sec read</span>
            </label>

            <label
              onClick={() => setSummaryDepth('deep')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                summaryDepth === 'deep'
                  ? 'bg-primary-container/10 border-primary text-on-surface'
                  : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary/50'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-label-sm">Deep Strategic Intelligence</div>
                <div className="text-[11px] text-on-surface-variant font-body-md">Comprehensive briefing, institutional impact, and bias radar</div>
              </div>
              <span className="text-xs font-mono font-bold text-secondary">~2 min read</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-surface border border-outline-variant cursor-pointer">
              <span className="text-xs font-label-sm font-semibold text-on-surface">
                Automate AI Analysis upon Feed Sync
              </span>
              <input
                type="checkbox"
                checked={autoAnalyze}
                onChange={(e) => setAutoAnalyze(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* 3. API Credentials & Endpoints */}
        <section className="lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">API Credentials &amp; Keys</h3>
              <p className="font-body-md text-xs text-on-surface-variant">Keys are stored securely in local database</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* NVIDIA NIM Key */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-label-sm font-bold text-emerald-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>NVIDIA NIM API Key (nvapi-...)</span>
                </label>
                <a
                  href="https://build.nvidia.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-label-sm font-semibold"
                >
                  <span>Get NVIDIA Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showNimKey ? 'text' : 'password'}
                  value={nimApiKey}
                  onChange={(e) => setNimApiKey(e.target.value)}
                  placeholder="nvapi-..."
                  className="w-full h-10 pl-3.5 pr-10 bg-surface border border-emerald-300 rounded-DEFAULT text-xs font-mono text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNimKey(!showNimKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showNimKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* NIM Model Selection */}
              <div>
                <label className="block text-[11px] font-label-sm font-semibold text-on-surface mb-1">
                  NVIDIA Model Endpoint
                </label>
                <select
                  value={nimModel}
                  onChange={(e) => setNimModel(e.target.value)}
                  className="w-full h-9 px-3 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface focus:outline-none focus:border-emerald-600"
                >
                  <option value="meta/llama-3.2-90b-vision-instruct">meta/llama-3.2-90b-vision-instruct (Recommended - 90B)</option>
                  <option value="meta/llama-3.2-11b-vision-instruct">meta/llama-3.2-11b-vision-instruct (Ultra Fast - 11B)</option>
                  <option value="nvidia/nemotron-3-super-120b-a12b">nvidia/nemotron-3-super-120b-a12b (Nemotron 120B)</option>
                  <option value="nvidia/nemotron-3.5-lightning-30b-a3b">nvidia/nemotron-3.5-lightning-30b-a3b</option>
                  <option value="google/diffusiongemma-26b-a4b-it">google/diffusiongemma-26b-a4b-it</option>
                </select>
              </div>
            </div>

            {/* Gemini Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-label-sm font-semibold text-on-surface">
                  Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-label-sm font-semibold"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full h-10 pl-3.5 pr-10 bg-surface border border-outline-variant rounded-DEFAULT text-xs font-mono text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* OpenAI Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-label-sm font-semibold text-on-surface">
                  OpenAI API Key
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-label-sm font-semibold"
                >
                  <span>Get OpenAI Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full h-10 pl-3.5 pr-10 bg-surface border border-outline-variant rounded-DEFAULT text-xs font-mono text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Ollama Endpoint */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-label-sm font-semibold text-on-surface mb-1">
                  Ollama Base URL
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full h-10 px-3 bg-surface border border-outline-variant rounded-DEFAULT text-xs font-mono text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-xs font-label-sm font-semibold text-on-surface mb-1">
                  Ollama Model Tag
                </label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.2:latest"
                  className="w-full h-10 px-3 bg-surface border border-outline-variant rounded-DEFAULT text-xs font-mono text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

