import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  fetchMercadoPagoPayment,
  loadCheckoutSession,
  persistOrderFromPayment,
} from "@/lib/orders-from-mp";

export async function POST(request: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const db = getAdminDb();

  if (!accessToken) {
    return NextResponse.json(
      {
        error:
          "No se pudo conectar con el sistema de pagos. Probá más tarde o contactá a soporte.",
      },
      { status: 500 }
    );
  }

  if (!db) {
    return NextResponse.json(
      { error: "El servidor no está configurado para sincronizar pagos." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const paymentId = body.paymentId as string | undefined;
    if (!paymentId) {
      return NextResponse.json({ error: "paymentId requerido" }, { status: 400 });
    }

    const payment = await fetchMercadoPagoPayment(paymentId, accessToken);
    if (!payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const preferenceId =
      payment.preference_id != null ? String(payment.preference_id) : null;

    const sessionItems = preferenceId ? await loadCheckoutSession(db, preferenceId) : [];

    const result = await persistOrderFromPayment({
      db,
      payment,
      paymentId,
      preferenceId,
      sessionItems,
    });

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      created: result.created,
      status: payment.status,
    });
  } catch (e) {
    console.error("sync-payment:", e);
    return NextResponse.json({ error: "Error al sincronizar" }, { status: 500 });
  }
}
