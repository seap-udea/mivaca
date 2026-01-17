import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { comensalId, consignadorName, amount } = body;

    if (!comensalId || !consignadorName || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: `Missing required fields: comensalId=${!!comensalId}, consignadorName=${!!consignadorName}, amount=${amount}` },
        { status: 400 }
      );
    }

    // Verify vaca exists
    const vaca = store.getVaca(id);
    if (!vaca) {
      return NextResponse.json(
        { error: 'Vaca not found' },
        { status: 404 }
      );
    }

    // Prevent duplicate payments per comensal
    const existing = store.getPaymentsByVaca(id).some((p) => p.comensalId === comensalId);
    if (existing) {
      return NextResponse.json(
        { error: 'Payment already registered for this comensal' },
        { status: 400 }
      );
    }

    const payment = store.addPayment(id, comensalId, consignadorName, Number(amount));
    const totalCollected = store.getTotalCollected(id);

    // Serialize date
    const serializedPayment = {
      ...payment,
      paidAt: payment.paidAt.toISOString(),
    };

    return NextResponse.json({ payment: serializedPayment, totalCollected });
  } catch (error) {
    console.error('Error adding payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add payment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payments = store.getPaymentsByVaca(id);
    const totalCollected = store.getTotalCollected(id);

    // Serialize dates
    const serializedPayments = payments.map(p => ({
      ...p,
      paidAt: p.paidAt.toISOString(),
    }));

    return NextResponse.json({ payments: serializedPayments, totalCollected });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get payments' },
      { status: 500 }
    );
  }
}

