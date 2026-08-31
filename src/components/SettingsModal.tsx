'use client';

import React, { useState, useEffect } from 'react';
import { AppSettings, LLMProviderType } from '@/lib/types';
import { X, Cpu, CheckCircle2, AlertCircle, Save, Eye, EyeOff, Sparkles, Zap } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (updated: Partial<AppSettings>) => Promise<void>;
}

export function SettingsModal({
  settings,
  isOpen,
  onClose,
  onSaveSettings,
}: SettingsModalProps) {
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
  const [autoAnalyze, setAutoAnalyze] = useState(settings?.autoAnalyzeOnIngest || false);

  const [showNimKey, setShowNimKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] rounded-xl flex flex-col overflow-hidden border border-outline-variant shadow-2xl bg-surface-container-lowest text-on-surface animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant flex items-center justify-between bg-background/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-DEFAULT bg-primary-container/10 border border-primary/30">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface tracking-tight">
                AI Provider &amp; LLM Engine Settings
              </h2>
              <p className="text-[11px] font-label-sm text-on-surface-variant">
                Configure NVIDIA NIM, Google Gemini, OpenAI, Local Ollama, or Offline NLP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-DEFAULT text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container border border-outline-variant transition"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Provider Selection Radio Cards */}
          <div>
            <label className="text-xs font-label-sm font-extrabold uppercase tracking-wider text-on-surface-variant block mb-3">
              Active LLM Engine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'nim', label: 'NVIDIA NIM', desc: 'Llama 3.2 / Nemotron', icon: '⚡' },
                { id: 'gemini', label: 'Gemini', desc: '2.0 Flash', icon: '✨' },
                { id: 'openai', label: 'OpenAI', desc: 'GPT-4o-mini', icon: '🤖' },
                { id: 'ollama', label: 'Ollama', desc: 'Local', icon: '🦙' },
                { id: 'offline', label: 'Offline', desc: 'Rule-based', icon: '🔒' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveProvider(p.id as LLMProviderType);
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    activeProvider === p.id
                      ? 'bg-primary-container/10 border-primary text-on-surface shadow-sm ring-1 ring-primary'
                      : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  <span className="text-lg block mb-1">{p.icon}</span>
                  <div className="font-headline font-bold text-xs text-on-surface truncate">{p.label}</div>
                  <div className="text-[10px] text-on-surface-variant font-medium truncate">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Provider Settings */}
          <div className="rounded-xl p-4 sm:p-5 border border-outline-variant bg-surface-container-low space-y-3.5 shadow-sm">
            {activeProvider === 'nim' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-label-sm font-bold text-emerald-800 block mb-1">
                    NVIDIA NIM API Key (nvapi-...)
                  </label>
                  <div className="relative">
                    <input
                      type={showNimKey ? 'text' : 'password'}
                      value={nimApiKey}
                      onChange={(e) => setNimApiKey(e.target.value)}
                      placeholder="nvapi-..."
                      className="w-full px-3.5 py-2.5 bg-surface border border-emerald-300 rounded-DEFAULT text-xs text-on-surface focus:outline-none focus:border-emerald-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNimKey(!showNimKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      {showNimKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-label-sm font-bold text-on-surface block mb-1">
                    NVIDIA Model Endpoint
                  </label>
                  <select
                    value={nimModel}
                    onChange={(e) => setNimModel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface focus:outline-none focus:border-emerald-600"
                  >
                    <option value="meta/llama-3.2-90b-vision-instruct">meta/llama-3.2-90b-vision-instruct (Recommended - 90B)</option>
                    <option value="meta/llama-3.2-11b-vision-instruct">meta/llama-3.2-11b-vision-instruct (Ultra Fast - 11B)</option>
                    <option value="nvidia/nemotron-3-super-120b-a12b">nvidia/nemotron-3-super-120b-a12b (Nemotron 120B)</option>
                    <option value="nvidia/nemotron-3.5-lightning-30b-a3b">nvidia/nemotron-3.5-lightning-30b-a3b</option>
                    <option value="google/diffusiongemma-26b-a4b-it">google/diffusiongemma-26b-a4b-it</option>
                  </select>
                </div>
              </div>
            )}
            {activeProvider === 'offline' && (
              <div className="text-xs text-on-surface leading-relaxed space-y-2 font-body-md">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold font-label-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Instant Out-of-the-Box Engine Active</span>
                </div>
                <p className="text-on-surface-variant">
                  Performs instant algorithmic linguistic sentiment scoring (-1.0 to 1.0), clickbait rating calculation, 6-tier tone classification, and extractive takeaway summarization completely offline with zero latency.
                </p>
              </div>
            )}

            {activeProvider === 'gemini' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-label-sm font-bold text-on-surface block mb-1">
                    Google Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface focus:outline-none focus:border-primary"
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
                <div>
                  <label className="text-xs font-label-sm font-bold text-on-surface block mb-1">
                    Gemini Model Identifier
                  </label>
                  <input
                    type="text"
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    placeholder="gemini-2.0-flash"
                    className="w-full px-3.5 py-2 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>
            )}

            {activeProvider === 'openai' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-label-sm font-bold text-on-surface block mb-1">
                    OpenAI API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface focus:outline-none focus:border-primary"
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
                <div>
                  <label className="text-xs font-label-sm font-bold text-on-surface block mb-1">
                    OpenAI Model Identifier
                  </label>
                  <input
                    type="text"
                    value={openaiModel}
                    onChange={(e) => setOpenaiModel(e.target.value)}
                    placeholder="gpt-4o-mini"
                    className="w-full px-3.5 py-2 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>
            )}

            {activeProvider === 'ollama' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-label-sm font-bold text-on-surface block mb-1">
                    Local Ollama Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-label-sm font-bold text-on-surface block mb-1">
                    Ollama Model Tag
                  </label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="llama3.2:latest"
                    className="w-full px-3.5 py-2 bg-surface border border-outline-variant rounded-DEFAULT text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>
            )}

            {/* Test Connection Button */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/60">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3.5 py-1.5 rounded-DEFAULT text-xs font-label-sm font-bold bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant transition disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 text-primary ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              {testResult && (
                <div
                  className={`text-xs font-label-sm font-semibold flex items-center space-x-1.5 ${
                    testResult.success ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span className="line-clamp-1">{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Auto Analyze Toggle */}
          <div className="rounded-xl p-4 flex items-center justify-between border border-outline-variant bg-surface-container-low">
            <div>
              <div className="text-xs font-headline font-bold text-on-surface">Auto-Analyze on RSS Ingest</div>
              <div className="text-[11px] text-on-surface-variant font-body-md">
                Automatically summarize and extract news tone for new incoming articles during background feed sync.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoAnalyze}
              onChange={(e) => setAutoAnalyze(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-outline-variant bg-surface-container-low flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-DEFAULT text-xs font-label-sm font-semibold text-on-surface-variant hover:text-on-surface transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-DEFAULT text-xs font-label-sm font-bold bg-primary hover:bg-primary-container text-on-primary transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}