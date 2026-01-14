import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { brebKey } = await request.json();

    if (!brebKey || typeof brebKey !== 'string') {
      return NextResponse.json(
        { error: 'Bre-B key is required' },
        { status: 400 }
      );
    }

    store.setBreBKey(id, brebKey.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting Bre-B key:', error);
    return NextResponse.json(
      { error: 'Failed to set Bre-B key', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Set to empty string to remove the key
    store.setBreBKey(id, '');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove Bre-B key' },
      { status: 500 }
    );
  }
}
