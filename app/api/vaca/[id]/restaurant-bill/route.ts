import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { restaurantBillTotal, distributeDifference } = await request.json();

    if (restaurantBillTotal === undefined || restaurantBillTotal === null) {
      return NextResponse.json(
        { error: 'Restaurant bill total is required' },
        { status: 400 }
      );
    }

    const total = Number(restaurantBillTotal);
    if (isNaN(total) || total < 0) {
      return NextResponse.json(
        { error: 'Invalid restaurant bill total' },
        { status: 400 }
      );
    }

    // Check if any comensal has paid
    const payments = store.getPaymentsByVaca(id);
    if (payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot modify restaurant bill total after payments have been made' },
        { status: 400 }
      );
    }

    // Save the restaurant bill total
    store.setRestaurantBillTotal(id, total);

    // If distributeDifference is true, calculate and distribute the difference
    if (distributeDifference) {
      const vaca = store.getVaca(id);
      if (!vaca) {
        return NextResponse.json(
          { error: 'Vaca not found' },
          { status: 404 }
        );
      }

      // Calculate subtotal from restaurant bill (subtract 10% service)
      // restaurantBillTotal = subtotal + (subtotal * 0.1) = subtotal * 1.1
      // Therefore: subtotal = restaurantBillTotal / 1.1
      const restaurantSubtotal = total / 1.1;

      // Calculate current subtotal from products (without service)
      const currentSubtotal = vaca.products.reduce(
        (sum, product) => sum + product.valorEnCarta * product.numero,
        0
      );

      // Calculate the difference in subtotals (before service)
      const difference = restaurantSubtotal - currentSubtotal;

      if (Math.abs(difference) > 0.01) { // Only distribute if difference is significant
        const comensales = store.getComensalesByVaca(id);
        
        if (comensales.length === 0) {
          return NextResponse.json(
            { error: 'No comensales to distribute difference' },
            { status: 400 }
          );
        }

        const differencePerComensal = difference / comensales.length;

        // Add the difference as a product for each comensal
        // The service (10%) will be added automatically when calculating totals
        comensales.forEach((comensal) => {
          store.addProduct(id, {
            producto: 'Diferencia restaurante',
            valorEnCarta: differencePerComensal,
            numero: 1,
            comensalId: comensal.id,
            comensalName: comensal.name,
          });
        });
      }
    }

    const newTotal = store.calculateTotal(id);

    return NextResponse.json({ success: true, total: newTotal });
  } catch (error) {
    console.error('Error setting restaurant bill total:', error);
    return NextResponse.json(
      { error: 'Failed to set restaurant bill total', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
