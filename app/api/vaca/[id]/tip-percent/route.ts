import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tipPercent } = await request.json();

    const percent = Number(tipPercent);
    if (!isFinite(percent) || percent < 0 || percent > 100) {
      return NextResponse.json(
        { error: "Invalid tip percent" },
        { status: 400 }
      );
    }

    // Block changes after payments to avoid retroactive changes.
    const payments = store.getPaymentsByVaca(id);
    if (payments.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot modify tip percent after payments have been made",
        },
        { status: 400 }
      );
    }

    store.setTipPercent(id, percent);
    const total = store.calculateTotal(id);

    return NextResponse.json({ success: true, total });
  } catch (error) {
    console.error("Error setting tip percent:", error);
    return NextResponse.json(
      {
        error: "Failed to set tip percent",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

