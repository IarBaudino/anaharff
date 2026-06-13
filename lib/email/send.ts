import { getAdminEmail, isEmailConfigured } from "@/lib/email/config";
import { sendViaSmtp } from "@/lib/email/smtp";
import type { OrderStatus } from "@/lib/commerce-types";
import {
  contactAdminEmail,
  orderAdminEmail,
  orderCustomerEmail,
  orderPendingAdminEmail,
  orderPendingCustomerEmail,
  orderRejectedAdminEmail,
  orderRejectedCustomerEmail,
  welcomeCustomerEmail,
  type ContactEmailPayload,
  type OrderEmailPayload,
} from "@/lib/email/templates";

const PAYMENT_EMAIL_STATUSES = new Set<OrderStatus>(["pendiente", "aprobado", "rechazado"]);

async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.warn("[email] SMTP no configurado; correo omitido:", params.subject);
    return { ok: false, error: "email_not_configured" };
  }

  return sendViaSmtp(params);
}

export async function sendContactEmail(payload: ContactEmailPayload) {
  const admin = getAdminEmail();
  if (!admin) {
    console.warn("[email] ADMIN_EMAIL no configurado");
    return { ok: false, error: "admin_email_missing" };
  }

  const mail = contactAdminEmail(payload);
  return sendEmail({
    to: admin,
    subject: mail.subject,
    html: mail.html,
    replyTo: mail.replyTo,
  });
}

export async function sendWelcomeEmail(nombre: string, email: string) {
  const mail = welcomeCustomerEmail(nombre, email);
  return sendEmail({
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
  });
}

async function sendOrderPairEmails(
  payload: OrderEmailPayload,
  customerMail: { subject: string; html: string; to: string } | null,
  adminMail: { subject: string; html: string } | null
) {
  const results = { customer: false, admin: false };

  if (payload.customerEmail?.includes("@") && customerMail) {
    const customerResult = await sendEmail({
      to: customerMail.to,
      subject: customerMail.subject,
      html: customerMail.html,
    });
    results.customer = customerResult.ok;
  }

  const admin = getAdminEmail();
  if (admin && adminMail) {
    const adminResult = await sendEmail({
      to: admin,
      subject: adminMail.subject,
      html: adminMail.html,
      replyTo: payload.customerEmail || undefined,
    });
    results.admin = adminResult.ok;
  }

  return results;
}

/** @deprecated usar sendOrderPaymentEmails */
export async function sendOrderConfirmationEmails(payload: OrderEmailPayload) {
  return sendOrderPaymentEmails("aprobado", payload);
}

export async function sendOrderPaymentEmails(status: OrderStatus, payload: OrderEmailPayload) {
  if (!PAYMENT_EMAIL_STATUSES.has(status)) {
    return { customer: false, admin: false };
  }

  if (status === "aprobado") {
    return sendOrderPairEmails(payload, orderCustomerEmail(payload), orderAdminEmail(payload));
  }
  if (status === "pendiente") {
    return sendOrderPairEmails(
      payload,
      orderPendingCustomerEmail(payload),
      orderPendingAdminEmail(payload)
    );
  }
  return sendOrderPairEmails(
    payload,
    orderRejectedCustomerEmail(payload),
    orderRejectedAdminEmail(payload)
  );
}
