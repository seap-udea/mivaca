import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vaca = store.getVaca(id);
    
    if (!vaca) {
      return NextResponse.json(
        { error: 'Vaca not found' },
        { status: 404 }
      );
    }

    const total = store.calculateTotal(id);
    
    // Serialize dates properly
    const serializedVaca = {
      ...vaca,
      createdAt: vaca.createdAt.toISOString(),
      products: vaca.products.map(p => ({
        ...p,
        addedAt: p.addedAt.toISOString(),
      })),
    };
    
    return NextResponse.json({ vaca: serializedVaca, total });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get vaca' },
      { status: 500 }
    );
  }
}

