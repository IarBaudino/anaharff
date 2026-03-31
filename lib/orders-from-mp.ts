import { FieldValue } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";
import type { CheckoutLineItem, OrderRecord, OrderStatus } from "@/lib/commerce-types";

type MPPayer = { email?: string; first_name?: string; last_name?: string };

type MPPayment = {
  id?: number | string;
  status?: string;
  transaction_amount?: number;
  currency_id?: string;
  preference_id?: string | number | null;
  payer?: MPPayer;
  external_reference?: string | null;
  metadata?: Record<string, string>;
  additional_info?: { items?: Array<{ id?: string; title?: string; quantity?: string; unit_price?: string }> };
};

function mapMpStatusToOrder(mp: string | undefined): OrderStatus {
  if (mp === "approved") return "aprobado";
  if (mp === "pending" || mp === "in_process") return "pendiente";
  if (mp === "rejected" || mp === "cancelled") return "rechazado";
  return "pendiente";
}

export async function fetchMercadoPagoPayment(
  paymentId: string,
  accessToken: string
): Promise<MPPayment | null> {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as MPPayment;
}

function itemsFromPaymentOrSession(
  payment: MPPayment,
  sessionItems: CheckoutLineItem[]
): CheckoutLineItem[] {
  const extra = payment.additional_info?.items;
  if (extra?.length) {
    return extra.map((row) => ({
      id: row.id || "item",
      title: row.title || "Producto",
      quantity: Number(row.quantity) || 1,
      unit_price: Number(row.unit_price) || 0,
      currency_id: payment.currency_id || "ARS",
    }));
  }
  return sessionItems;
}

export async function persistOrderFromPayment(params: {
  db: Firestore;
  payment: MPPayment;
  paymentId: string;
  preferenceId: string | null;
  sessionItems: CheckoutLineItem[];
}): Promise<{ orderId: string; created: boolean }> {
  const { db, payment, paymentId, preferenceId, sessionItems } = params;

  const ordersCol = db.collection("orders");
  const existing = await ordersCol
    .where("mercadoPagoPaymentId", "==", String(paymentId))
    .limit(1)
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0]!;
    return { orderId: doc.id, created: false };
  }

  const items = itemsFromPaymentOrSession(payment, sessionItems);
  const total =
    payment.transaction_amount ??
    items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  const customerUid = payment.metadata?.customer_uid || null;
  const customerEmail = payment.payer?.email || payment.metadata?.customer_email || null;
  const payerName =
    [payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(" ").trim() ||
    null;

  const orderRef = ordersCol.doc();
  const orderStatus = mapMpStatusToOrder(payment.status);

  const record: OrderRecord = {
    status: orderStatus,
    items,
    total,
    currency_id: payment.currency_id || "ARS",
    customerUid,
    customerEmail,
    payerName,
    mercadoPagoPaymentId: String(paymentId),
    mercadoPagoPreferenceId: preferenceId,
    mercadoPagoStatus: payment.status ?? null,
    externalReference: payment.external_reference ?? null,
    notasAdmin: "",
    createdAt: FieldValue.serverTimestamp() as never,
    updatedAt: FieldValue.serverTimestamp() as never,
  };

  await orderRef.set(record);

  if (customerUid && orderStatus === "aprobado") {
    const custRef = db.collection("customers").doc(customerUid);
    await custRef.set(
      {
        ordersCount: FieldValue.increment(1),
        lastOrderAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  if (preferenceId) {
    await db.collection("checkout_sessions").doc(preferenceId).set(
      {
        status: orderStatus === "aprobado" ? "completado" : "pendiente",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  return { orderId: orderRef.id, created: true };
}

export async function loadCheckoutSession(
  db: Firestore,
  preferenceId: string
): Promise<CheckoutLineItem[]> {
  const snap = await db.collection("checkout_sessions").doc(preferenceId).get();
  if (!snap.exists) return [];
  const data = snap.data() as { items?: CheckoutLineItem[] };
  return data.items ?? [];
}
