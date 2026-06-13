import { FieldValue } from "firebase-admin/firestore";
import type { DocumentReference, Firestore } from "firebase-admin/firestore";
import type { CheckoutLineItem, OrderRecord, OrderStatus } from "@/lib/commerce-types";
import { notifyOrderPaymentEmails } from "@/lib/email/order-notifications";

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

type OrderEmailContext = {
  orderId: string;
  orderStatus: OrderStatus;
  previousNotifiedStatus: OrderStatus | null | undefined;
  customerEmail: string | null;
  payerName: string | null;
  items: CheckoutLineItem[];
  total: number;
  currency_id: string;
  paymentId: string;
};

async function sendOrderEmailsAndMark(
  db: Firestore,
  orderRef: DocumentReference,
  ctx: OrderEmailContext
) {
  const notified = await notifyOrderPaymentEmails({
    orderId: ctx.orderId,
    status: ctx.orderStatus,
    previousNotifiedStatus: ctx.previousNotifiedStatus,
    customerEmail: ctx.customerEmail,
    payerName: ctx.payerName,
    items: ctx.items,
    total: ctx.total,
    currency_id: ctx.currency_id,
    mercadoPagoPaymentId: ctx.paymentId,
  });

  if (notified) {
    await orderRef.update({
      lastEmailNotifiedStatus: notified,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

async function bumpCustomerOrderStats(db: Firestore, customerUid: string) {
  await db.collection("customers").doc(customerUid).set(
    {
      ordersCount: FieldValue.increment(1),
      lastOrderAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
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

  const items = itemsFromPaymentOrSession(payment, sessionItems);
  const total =
    payment.transaction_amount ?? items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  const customerUid = payment.metadata?.customer_uid || null;
  const customerEmail = payment.payer?.email || payment.metadata?.customer_email || null;
  const payerName =
    [payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(" ").trim() ||
    null;

  const orderStatus = mapMpStatusToOrder(payment.status);

  if (!existing.empty) {
    const doc = existing.docs[0]!;
    const prev = doc.data() as OrderRecord;
    const prevStatus = prev.status;
    const statusChanged = prevStatus !== orderStatus;

    if (statusChanged) {
      await doc.ref.update({
        status: orderStatus,
        mercadoPagoStatus: payment.status ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (orderStatus === "aprobado" && prevStatus !== "aprobado" && customerUid) {
        await bumpCustomerOrderStats(db, customerUid);
      }
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

    await sendOrderEmailsAndMark(db, doc.ref, {
      orderId: doc.id,
      orderStatus,
      previousNotifiedStatus: prev.lastEmailNotifiedStatus ?? null,
      customerEmail: customerEmail ?? prev.customerEmail,
      payerName: payerName ?? prev.payerName,
      items: items.length ? items : prev.items,
      total,
      currency_id: payment.currency_id || prev.currency_id || "ARS",
      paymentId: String(paymentId),
    });

    return { orderId: doc.id, created: false };
  }

  const orderRef = ordersCol.doc();

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
    await bumpCustomerOrderStats(db, customerUid);
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

  await sendOrderEmailsAndMark(db, orderRef, {
    orderId: orderRef.id,
    orderStatus,
    previousNotifiedStatus: null,
    customerEmail,
    payerName,
    items,
    total,
    currency_id: record.currency_id,
    paymentId: String(paymentId),
  });

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
