import { FieldValue } from "firebase-admin/firestore";
import type { DocumentReference, Firestore } from "firebase-admin/firestore";
import type { CheckoutLineItem, OrderRecord, OrderShipping, OrderStatus } from "@/lib/commerce-types";
import { notifyOrderPaymentEmails } from "@/lib/email/order-notifications";
import { decrementProductStock } from "@/lib/inventory";

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
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[mp] fetch payment failed", res.status, paymentId, body.slice(0, 300));
    return null;
  }
  return (await res.json()) as MPPayment;
}

function itemsFromPaymentOrSession(
  payment: MPPayment,
  sessionItems: CheckoutLineItem[]
): CheckoutLineItem[] {
  const extra = payment.additional_info?.items;
  const raw: CheckoutLineItem[] = extra?.length
    ? extra.map((row) => ({
        id: row.id || "item",
        title: row.title || "Producto",
        quantity: Number(row.quantity) || 1,
        unit_price: Number(row.unit_price) || 0,
        currency_id: payment.currency_id || "ARS",
      }))
    : sessionItems;

  return raw.map((item) => {
    const clean: CheckoutLineItem = {
      id: String(item.id || "item"),
      title: String(item.title || "Producto"),
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
      currency_id: item.currency_id || "ARS",
    };
    if (item.description) clean.description = String(item.description);
    if (item.picture_url) clean.picture_url = String(item.picture_url);
    return clean;
  });
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
  shipping?: OrderShipping | null;
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
    shipping: ctx.shipping ?? null,
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

async function applyStockIfApproved(
  db: Firestore,
  orderRef: DocumentReference,
  orderData: OrderRecord,
  items: CheckoutLineItem[]
) {
  if (orderData.status !== "aprobado" || orderData.stockApplied) return;
  await decrementProductStock(db, items);
  await orderRef.update({
    stockApplied: true,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function persistOrderFromPayment(params: {
  db: Firestore;
  payment: MPPayment;
  paymentId: string;
  preferenceId: string | null;
  sessionItems: CheckoutLineItem[];
  sessionShipping?: OrderShipping | null;
  sessionCustomerUid?: string | null;
  sessionCustomerEmail?: string | null;
}): Promise<{ orderId: string; created: boolean }> {
  const {
    db,
    payment,
    paymentId,
    preferenceId,
    sessionItems,
    sessionShipping,
    sessionCustomerUid,
    sessionCustomerEmail,
  } = params;

  const ordersCol = db.collection("orders");
  const existing = await ordersCol
    .where("mercadoPagoPaymentId", "==", String(paymentId))
    .limit(1)
    .get()
    .catch((err) => {
      console.error("[orders] lookup by payment id:", err);
      return null;
    });

  const items = itemsFromPaymentOrSession(payment, sessionItems);
  const total =
    payment.transaction_amount ?? items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  // Prioridad: sesión del checkout (cuenta del sitio) > metadata MP > email del pagador de prueba.
  const customerUid =
    sessionCustomerUid ||
    payment.metadata?.customer_uid ||
    null;
  const customerEmail =
    sessionCustomerEmail ||
    payment.metadata?.customer_email ||
    payment.payer?.email ||
    null;
  const payerName =
    [payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(" ").trim() ||
    null;

  const orderStatus = mapMpStatusToOrder(payment.status);

  if (existing && !existing.empty) {
    const doc = existing.docs[0]!;
    const prev = doc.data() as OrderRecord;
    const prevStatus = prev.status;
    const statusChanged = prevStatus !== orderStatus;
    const linkPatch: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (statusChanged) {
      linkPatch.status = orderStatus;
      linkPatch.mercadoPagoStatus = payment.status ?? null;
    }
    // Repara pedidos viejos que quedaron con email del TESTUSER de MP.
    if (customerUid && !prev.customerUid) linkPatch.customerUid = customerUid;
    if (customerEmail && customerEmail !== prev.customerEmail) {
      const prevLooksLikeMpTest =
        !prev.customerEmail ||
        String(prev.customerEmail).toLowerCase().includes("testuser") ||
        String(prev.customerEmail).toLowerCase().endsWith("@testuser.com");
      if (prevLooksLikeMpTest || !prev.customerEmail) {
        linkPatch.customerEmail = customerEmail;
      }
    }

    if (Object.keys(linkPatch).length > 1 || statusChanged) {
      await doc.ref.update(linkPatch);
    }

    if (statusChanged && orderStatus === "aprobado" && prevStatus !== "aprobado" && customerUid) {
      try {
        await bumpCustomerOrderStats(db, customerUid);
      } catch (e) {
        console.error("[orders] bumpCustomerOrderStats:", e);
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

    try {
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
        shipping: sessionShipping ?? prev.shipping ?? null,
      });
    } catch (e) {
      console.error("[orders] emails:", e);
    }

    const mergedItems = items.length ? items : prev.items;
    const mergedStatus = statusChanged ? orderStatus : prevStatus;
    try {
      await applyStockIfApproved(
        db,
        doc.ref,
        { ...prev, status: mergedStatus, stockApplied: prev.stockApplied },
        mergedItems
      );
    } catch (e) {
      console.error("[orders] stock:", e);
    }

    return { orderId: doc.id, created: false };
  }

  const orderRef = ordersCol.doc();

  const record: Record<string, unknown> = {
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
    stockApplied: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const shipping = sessionShipping ?? null;
  if (shipping) {
    record.shipping = shipping;
  }

  await orderRef.set(record);

  if (customerUid && orderStatus === "aprobado") {
    try {
      await bumpCustomerOrderStats(db, customerUid);
    } catch (e) {
      console.error("[orders] bumpCustomerOrderStats:", e);
    }
  }

  if (preferenceId) {
    try {
      await db.collection("checkout_sessions").doc(preferenceId).set(
        {
          status: orderStatus === "aprobado" ? "completado" : "pendiente",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("[orders] checkout_sessions update:", e);
    }
  }

  try {
    await sendOrderEmailsAndMark(db, orderRef, {
      orderId: orderRef.id,
      orderStatus,
      previousNotifiedStatus: null,
      customerEmail,
      payerName,
      items,
      total,
      currency_id: String(record.currency_id),
      paymentId: String(paymentId),
      shipping,
    });
  } catch (e) {
    console.error("[orders] emails:", e);
  }

  if (orderStatus === "aprobado") {
    try {
      await applyStockIfApproved(
        db,
        orderRef,
        {
          status: orderStatus,
          items,
          total,
          currency_id: String(record.currency_id),
          customerUid,
          customerEmail,
          payerName,
          shipping: shipping ?? undefined,
          mercadoPagoPaymentId: String(paymentId),
          mercadoPagoPreferenceId: preferenceId,
          mercadoPagoStatus: payment.status ?? null,
          externalReference: payment.external_reference ?? null,
          stockApplied: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        items
      );
    } catch (e) {
      console.error("[orders] stock:", e);
    }
  }

  return { orderId: orderRef.id, created: true };
}

export async function loadCheckoutSession(
  db: Firestore,
  preferenceId: string
): Promise<CheckoutLineItem[]> {
  const data = await loadCheckoutSessionData(db, preferenceId);
  return data.items;
}

export async function loadCheckoutSessionData(
  db: Firestore,
  preferenceId: string
): Promise<{
  items: CheckoutLineItem[];
  shipping?: OrderShipping | null;
  customerUid?: string | null;
  customerEmail?: string | null;
}> {
  const snap = await db.collection("checkout_sessions").doc(preferenceId).get();
  if (!snap.exists) return { items: [] };
  const data = snap.data() as {
    items?: CheckoutLineItem[];
    shipping?: OrderShipping;
    customerUid?: string | null;
    customerEmail?: string | null;
  };
  return {
    items: data.items ?? [],
    shipping: data.shipping ?? null,
    customerUid: data.customerUid ?? null,
    customerEmail: data.customerEmail ?? null,
  };
}
