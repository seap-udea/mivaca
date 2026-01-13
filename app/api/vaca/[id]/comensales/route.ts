import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comensales = store.getComensalesByVaca(id);
    
    // Serialize dates
    const serializedComensales = comensales.map(c => ({
      ...c,
      joinedAt: c.joinedAt.toISOString(),
    }));

    return NextResponse.json({ comensales: serializedComensales });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get comensales' },
      { status: 500 }
    );
  }
}

