import { NextRequest, NextResponse } from 'next/server';
import { deleteFeed, updateFeed, getFeedById } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteFeed(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Feed not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Feed deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateFeed(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Feed not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, feed: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
