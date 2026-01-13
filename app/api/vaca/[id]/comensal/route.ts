import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const comensal = store.addComensal(id, name);

    return NextResponse.json({ comensal });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add comensal' },
      { status: 500 }
    );
  }
}

