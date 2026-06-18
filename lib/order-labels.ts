import type { OrderStatus } from "@/lib/commerce-types";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  en_preparacion: "En preparación",
  completado: "Completado",
  cancelado: "Cancelado",
};

/** Texto orientado al comprador en «Mis pedidos». */
export const orderStatusCustomerHint: Record<OrderStatus, string> = {
  pendiente: "Mercado Pago está procesando el pago. Te avisamos por email cuando se confirme.",
  aprobado: "Pago confirmado. Preparamos tu impresión para el envío.",
  rechazado: "El pago no se completó. Podés intentar de nuevo desde la tienda.",
  en_preparacion: "Tu pedido está en preparación para el envío.",
  completado: "Pedido enviado o entregado. Gracias por tu compra.",
  cancelado: "Este pedido fue cancelado.",
};

export function orderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "aprobado":
    case "completado":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "en_preparacion":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "rechazado":
    case "cancelado":
      return "border-red-200 bg-red-50 text-red-900";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}
