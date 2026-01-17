import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { fromComensalId, toComensalId } = await request.json();

    if (!fromComensalId || !toComensalId) {
      return NextResponse.json(
        { error: "fromComensalId and toComensalId are required" },
        { status: 400 }
      );
    }

    const vaca = store.getVaca(id);
    if (!vaca) {
      return NextResponse.json({ error: "Vaca not found" }, { status: 404 });
    }

    // Safety: don't allow merging if any of the accounts already paid
    const payments = store.getPaymentsByVaca(id);
    const paidIds = new Set(payments.map((p) => p.comensalId));
    if (paidIds.has(fromComensalId) || paidIds.has(toComensalId)) {
      return NextResponse.json(
        { error: "Cannot merge accounts after payments have been made" },
        { status: 400 }
      );
    }

    store.mergeComensalAccounts(id, String(fromComensalId), String(toComensalId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error merging comensal accounts:", error);
    return NextResponse.json(
      {
        error: "Failed to merge comensal accounts",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

