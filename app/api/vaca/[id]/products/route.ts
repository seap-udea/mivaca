import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { producto, valorEnCarta, numero, comensalId, comensalName, addedByVaquero, distributionGroupId } = await request.json();

    if (!producto || !valorEnCarta || !numero || !comensalId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = store.addProduct(id, {
      producto,
      valorEnCarta: Number(valorEnCarta),
      numero: Number(numero),
      comensalId,
      comensalName,
      addedByVaquero: addedByVaquero === true,
      distributionGroupId: distributionGroupId || undefined,
    });

    const total = store.calculateTotal(id);

    return NextResponse.json({ product, total });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add product' },
      { status: 500 }
    );
  }
}

