import type { CheckoutLineItem, OrderShipping, OrderStatus } from "@/lib/commerce-types";
import { sendOrderPaymentEmails } from "@/lib/email/send";

const PAYMENT_NOTIFY_STATUSES = new Set<OrderStatus>(["pendiente", "aprobado", "rechazado"]);

export async function notifyOrderPaymentEmails(params: {
  orderId: string;
  status: OrderStatus;
  previousNotifiedStatus?: OrderStatus | null;
  customerEmail: string | null;
  payerName: string | null;
  items: CheckoutLineItem[];
  total: number;
  currency_id: string;
  mercadoPagoPaymentId: string;
  shipping?: OrderShipping | null;
}): Promise<OrderStatus | null> {
  const { status, previousNotifiedStatus } = params;

  if (!PAYMENT_NOTIFY_STATUSES.has(status)) return null;
  if (previousNotifiedStatus === status) return null;

  const payload = {
    orderId: params.orderId,
    customerEmail: params.customerEmail || "",
    payerName: params.payerName,
    items: params.items,
    total: params.total,
    currency_id: params.currency_id,
    mercadoPagoPaymentId: params.mercadoPagoPaymentId,
    shipping: params.shipping ?? null,
  };

  try {
    await sendOrderPaymentEmails(status, payload);
    return status;
  } catch (e) {
    console.error("[email] order notifications failed:", e);
    return null;
  }
}
