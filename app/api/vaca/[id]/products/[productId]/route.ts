import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { id, productId } = await params;
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { comensalId } = body;

    if (!comensalId) {
      return NextResponse.json(
        { error: 'comensalId is required' },
        { status: 400 }
      );
    }

    // Verify vaca exists
    const vaca = store.getVaca(id);
    if (!vaca) {
      console.error(`Vaca not found: ${id}`);
      return NextResponse.json(
        { error: 'Vaca not found. Please refresh the page and try again.' },
        { status: 404 }
      );
    }

    const success = store.removeProduct(id, productId, comensalId);

    if (!success) {
      return NextResponse.json(
        { error: 'Product not found or not authorized' },
        { status: 404 }
      );
    }

    const total = store.calculateTotal(id);

    return NextResponse.json({ success: true, total });
  } catch (error) {
    console.error('Error removing product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove product' },
      { status: 500 }
    );
  }
}

