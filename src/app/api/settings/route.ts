import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { getLLMProvider } from '@/lib/llm/factory';

export async function GET() {
  try {
    const settings = getSettings();
    // Mask sensitive keys for frontend display if present
    const sanitized = {
      ...settings,
      hasGeminiKey: Boolean(settings.geminiApiKey),
      hasOpenAiKey: Boolean(settings.openaiApiKey),
    };
    return NextResponse.json({ success: true, settings: sanitized });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
