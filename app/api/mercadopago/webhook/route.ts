import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  fetchMercadoPagoPayment,
  loadCheckoutSession,
  persistOrderFromPayment,
} from "@/lib/orders-from-mp";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const db = getAdminDb();

  if (!accessToken || !db) {
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    const body = await request.json();
    const topic = body.type || body.topic;
    const dataId = body.data?.id;

    if (topic !== "payment" || !dataId) {
      return NextResponse.json({ received: true });
    }

    const payment = await fetchMercadoPagoPayment(String(dataId), accessToken);
    if (!payment) {
      return NextResponse.json({ received: true });
    }

    const preferenceId =
      payment.preference_id != null ? String(payment.preference_id) : null;

    const sessionItems = preferenceId ? await loadCheckoutSession(db, preferenceId) : [];

    await persistOrderFromPayment({
      db,
      payment,
      paymentId: String(dataId),
      preferenceId,
      sessionItems,
    });

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook MP error:", e);
    return NextResponse.json({ received: true });
  }
}
