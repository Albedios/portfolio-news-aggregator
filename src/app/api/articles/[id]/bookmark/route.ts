import { NextRequest, NextResponse } from 'next/server';
import { toggleBookmark, markAsRead } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isBookmarked = toggleBookmark(id);
    return NextResponse.json({ success: true, isBookmarked });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    markAsRead(id);
    return NextResponse.json({ success: true, isRead: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}