import { absoluteUrl } from "@/lib/seo";
import { escapeHtml, formatMoneyArs } from "@/lib/email/format";
import type { CheckoutLineItem, OrderShipping } from "@/lib/commerce-types";
import { formatShippingAddressBlock } from "@/lib/shipping";

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e8e4dc;">
        <tr><td style="padding:28px 32px 8px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8c8c8c;">Ana Harff</p>
          <h1 style="margin:12px 0 0;font-size:22px;font-weight:400;line-height:1.35;color:#1a1a1a;">${escapeHtml(title)}</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 32px;font-size:15px;line-height:1.65;color:#2d2d2d;">
          ${bodyHtml}
        </td></tr>
      </table>
      <p style="margin:20px 0 0;font-size:12px;color:#8c8c8c;">Fotografía analógica · Buenos Aires</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function itemsTableHtml(items: CheckoutLineItem[]): string {
  const rows = items
    .map((item) => {
      const subtotal = item.unit_price * item.quantity;
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(item.title)} × ${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${formatMoneyArs(subtotal, item.currency_id || "ARS")}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">
    ${rows}
  </table>`;
}

export type ContactEmailPayload = {
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  tipoConsulta: string;
  tipoConsultaLabel: string;
  asunto?: string;
  ubicacion?: string;
  preferenciaContacto: string;
  preferenciaLabel: string;
  comoNosConociste?: string;
  origenLabel?: string;
  mensaje: string;
};

export function contactAdminEmail(payload: ContactEmailPayload) {
  const nombreCompleto = [payload.nombre, payload.apellido].filter(Boolean).join(" ").trim();
  const subject = payload.asunto?.trim()
    ? `Contacto: ${payload.asunto.trim()}`
    : `Contacto web — ${payload.tipoConsultaLabel}`;

  const lines = [
    ["Nombre", nombreCompleto],
    ["Email", payload.email],
    ["Teléfono", payload.telefono || "—"],
    ["Motivo", payload.tipoConsultaLabel],
    ["Preferencia de respuesta", payload.preferenciaLabel],
    ["Ubicación", payload.ubicacion || "—"],
    ["¿Cómo me conoció?", payload.origenLabel || "—"],
    ["Asunto", payload.asunto || "—"],
  ];

  const details = lines
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 10px;"><strong style="color:#5c4d3d;">${escapeHtml(label)}:</strong><br>${escapeHtml(value)}</p>`
    )
    .join("");

  const html = layout(
    "Nuevo mensaje de contacto",
    `${details}
     <p style="margin:20px 0 8px;"><strong style="color:#5c4d3d;">Mensaje</strong></p>
     <p style="margin:0;white-space:pre-wrap;">${escapeHtml(payload.mensaje)}</p>`
  );

  return { subject, html, replyTo: payload.email };
}

export function welcomeCustomerEmail(nombre: string, email: string) {
  const saludo = nombre.trim() ? escapeHtml(nombre.trim()) : "hola";
  const cuentaUrl = absoluteUrl("/cuenta");
  const tiendaUrl = absoluteUrl("/tienda");

  const html = layout(
    "Bienvenida a tu cuenta",
    `<p style="margin:0 0 16px;">${saludo}, gracias por registrarte en el sitio.</p>
     <p style="margin:0 0 16px;">Desde tu cuenta podés ver el historial de tus compras de impresiones y guardar tu dirección de envío.</p>
     <p style="margin:0 0 20px;">
       <a href="${cuentaUrl}" style="color:#5c4d3d;">Ir a mi cuenta</a>
       ·
       <a href="${tiendaUrl}" style="color:#5c4d3d;">Ver la tienda</a>
     </p>
     <p style="margin:0;font-size:13px;color:#8c8c8c;">Si no creaste esta cuenta, podés ignorar este correo.</p>`
  );

  return {
    subject: "Bienvenida — Ana Harff",
    html,
    to: email,
  };
}

export type OrderEmailPayload = {
  orderId: string;
  customerEmail: string;
  payerName: string | null;
  items: CheckoutLineItem[];
  total: number;
  currency_id: string;
  mercadoPagoPaymentId: string;
  shipping?: OrderShipping | null;
};

function shippingBlockHtml(shipping?: OrderShipping | null): string {
  if (!shipping?.address) return "";
  const text = formatShippingAddressBlock(shipping.address);
  const cost =
    shipping.cost > 0
      ? `<p style="margin:0 0 8px;"><strong style="color:#5c4d3d;">Envío (${escapeHtml(shipping.zonaLabel)}):</strong> ${formatMoneyArs(shipping.cost, "ARS")}</p>`
      : `<p style="margin:0 0 8px;"><strong style="color:#5c4d3d;">Envío (${escapeHtml(shipping.zonaLabel)}):</strong> sin cargo</p>`;
  return `${cost}<pre style="margin:0 0 16px;padding:12px;background:#f7f5f0;border:1px solid #e8e4dc;font-family:Georgia,serif;font-size:13px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(text)}</pre>`;
}

export function orderCustomerEmail(payload: OrderEmailPayload) {
  const saludo = payload.payerName?.trim() ? escapeHtml(payload.payerName.trim()) : "hola";
  const cuentaUrl = absoluteUrl("/cuenta");
  const contactoUrl = absoluteUrl("/contacto");

  const html = layout(
    "Confirmación de compra",
    `<p style="margin:0 0 16px;">${saludo}, recibimos tu pago. Gracias por tu compra.</p>
     <p style="margin:0 0 8px;">Preparamos tu <strong>impresión</strong> y la enviamos a la dirección indicada. Te avisaremos cuando esté en camino.</p>
     ${shippingBlockHtml(payload.shipping)}
     <p style="margin:0 0 4px;font-size:13px;color:#8c8c8c;">Pedido #${escapeHtml(payload.orderId.slice(0, 8))}</p>
     ${itemsTableHtml(payload.items)}
     <p style="margin:8px 0 20px;font-size:16px;"><strong>Total: ${formatMoneyArs(payload.total, payload.currency_id)}</strong></p>
     <p style="margin:0 0 16px;">
       <a href="${cuentaUrl}" style="color:#5c4d3d;">Ver mis pedidos</a>
       ·
       <a href="${contactoUrl}" style="color:#5c4d3d;">Contacto</a>
     </p>
     <p style="margin:0;font-size:13px;color:#8c8c8c;">Conservá este correo como comprobante.</p>`
  );

  return {
    subject: "Tu compra en Ana Harff — confirmación",
    html,
    to: payload.customerEmail,
  };
}

function orderAdminIntro(statusLabel: string): string {
  return `<p style="margin:0 0 16px;">${escapeHtml(statusLabel)}</p>`;
}

function orderAdminDetails(payload: OrderEmailPayload): string {
  const cliente =
    payload.payerName?.trim() || payload.customerEmail || "Cliente sin nombre";
  const adminUrl = absoluteUrl("/admin");

  return `<p style="margin:0 0 10px;"><strong style="color:#5c4d3d;">Cliente:</strong> ${escapeHtml(cliente)}</p>
     <p style="margin:0 0 10px;"><strong style="color:#5c4d3d;">Email:</strong> ${escapeHtml(payload.customerEmail || "—")}</p>
     ${shippingBlockHtml(payload.shipping)}
     <p style="margin:0 0 10px;"><strong style="color:#5c4d3d;">Pago MP:</strong> ${escapeHtml(payload.mercadoPagoPaymentId)}</p>
     <p style="margin:0 0 4px;font-size:13px;color:#8c8c8c;">Pedido #${escapeHtml(payload.orderId)}</p>
     ${itemsTableHtml(payload.items)}
     <p style="margin:8px 0 20px;font-size:16px;"><strong>Total: ${formatMoneyArs(payload.total, payload.currency_id)}</strong></p>
     <p style="margin:0;"><a href="${adminUrl}" style="color:#5c4d3d;">Abrir panel de pedidos</a></p>`;
}

export function orderAdminEmail(payload: OrderEmailPayload) {
  const html = layout(
    "Nueva venta en la tienda",
    orderAdminIntro("Se registró una compra aprobada en la tienda.") + orderAdminDetails(payload)
  );

  return {
    subject: `Nueva venta — ${formatMoneyArs(payload.total, payload.currency_id)}`,
    html,
  };
}

export function orderPendingCustomerEmail(payload: OrderEmailPayload) {
  const saludo = payload.payerName?.trim() ? escapeHtml(payload.payerName.trim()) : "hola";
  const pendienteUrl = absoluteUrl("/tienda/pendiente");
  const contactoUrl = absoluteUrl("/contacto");

  const html = layout(
    "Pago en proceso",
    `<p style="margin:0 0 16px;">${saludo}, recibimos tu pedido pero el pago todavía está <strong>pendiente de confirmación</strong>.</p>
     <p style="margin:0 0 8px;">Cuando Mercado Pago lo apruebe te llegará otro correo. Tu compra incluye impresión física con envío.</p>
     ${shippingBlockHtml(payload.shipping)}
     <p style="margin:0 0 4px;font-size:13px;color:#8c8c8c;">Pedido #${escapeHtml(payload.orderId.slice(0, 8))}</p>
     ${itemsTableHtml(payload.items)}
     <p style="margin:8px 0 20px;font-size:16px;"><strong>Total: ${formatMoneyArs(payload.total, payload.currency_id)}</strong></p>
     <p style="margin:0 0 16px;">
       <a href="${pendienteUrl}" style="color:#5c4d3d;">Estado del pago</a>
       ·
       <a href="${contactoUrl}" style="color:#5c4d3d;">Contacto</a>
     </p>`
  );

  return {
    subject: "Tu pedido en Ana Harff — pago pendiente",
    html,
    to: payload.customerEmail,
  };
}

export function orderPendingAdminEmail(payload: OrderEmailPayload) {
  const html = layout(
    "Pago pendiente",
    orderAdminIntro("Hay un pedido con pago pendiente en la tienda.") + orderAdminDetails(payload)
  );

  return {
    subject: `Pago pendiente — ${formatMoneyArs(payload.total, payload.currency_id)}`,
    html,
  };
}

export function orderRejectedCustomerEmail(payload: OrderEmailPayload) {
  const saludo = payload.payerName?.trim() ? escapeHtml(payload.payerName.trim()) : "hola";
  const tiendaUrl = absoluteUrl("/tienda");
  const contactoUrl = absoluteUrl("/contacto");

  const html = layout(
    "Pago no completado",
    `<p style="margin:0 0 16px;">${saludo}, el pago de tu pedido <strong>no se completó</strong> o fue rechazado.</p>
     <p style="margin:0 0 8px;">No se registró ninguna compra. Podés intentar de nuevo desde la tienda o escribirme si necesitás ayuda.</p>
     <p style="margin:0 0 4px;font-size:13px;color:#8c8c8c;">Referencia #${escapeHtml(payload.orderId.slice(0, 8))}</p>
     ${itemsTableHtml(payload.items)}
     <p style="margin:8px 0 20px;font-size:16px;"><strong>Total: ${formatMoneyArs(payload.total, payload.currency_id)}</strong></p>
     <p style="margin:0 0 16px;">
       <a href="${tiendaUrl}" style="color:#5c4d3d;">Volver a la tienda</a>
       ·
       <a href="${contactoUrl}" style="color:#5c4d3d;">Contacto</a>
     </p>`
  );

  return {
    subject: "Tu pago en Ana Harff — no se completó",
    html,
    to: payload.customerEmail,
  };
}

export function orderRejectedAdminEmail(payload: OrderEmailPayload) {
  const html = layout(
    "Pago rechazado",
    orderAdminIntro("Un pago fue rechazado o cancelado en la tienda.") + orderAdminDetails(payload)
  );

  return {
    subject: `Pago rechazado — ${formatMoneyArs(payload.total, payload.currency_id)}`,
    html,
  };
}
