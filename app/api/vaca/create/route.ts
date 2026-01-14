import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { name, vaqueroName } = await request.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!vaqueroName || typeof vaqueroName !== 'string') {
      return NextResponse.json(
        { error: 'Vaquero name is required' },
        { status: 400 }
      );
    }

    // Generate a vaquero ID (in a real app, this would come from authentication)
    const vaqueroId = uuidv4();
    const vaca = store.createVaca(name, vaqueroId, vaqueroName.trim());

    return NextResponse.json({ vaca, vaqueroId });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create vaca' },
      { status: 500 }
    );
  }
}

