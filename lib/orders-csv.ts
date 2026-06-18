import type { OrderRecord, OrderStatus } from "@/lib/commerce-types";
import { orderStatusLabels } from "@/lib/order-labels";

function csvCell(value: string | number | null | undefined): string {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function formatCsvDate(d: unknown): string {
  if (!d) return "";
  if (typeof d === "object" && d !== null && "toDate" in d && typeof d.toDate === "function") {
    return (d.toDate as () => Date)().toISOString();
  }
  if (d instanceof Date) return d.toISOString();
  return String(d);
}

export function ordersToCsv(orders: (OrderRecord & { id: string })[]): string {
  const headers = [
    "id",
    "fecha",
    "estado",
    "cliente_email",
    "cliente_nombre",
    "total",
    "moneda",
    "mp_payment_id",
    "items",
    "envio_zona",
    "envio_costo",
  ];

  const rows = orders.map((o) => {
    const itemsSummary = (o.items ?? [])
      .map((it) => `${it.title} x${it.quantity}`)
      .join("; ");
    return [
      o.id,
      formatCsvDate(o.createdAt),
      orderStatusLabels[o.status as OrderStatus] ?? o.status,
      o.customerEmail ?? "",
      o.payerName ?? "",
      o.total,
      o.currency_id,
      o.mercadoPagoPaymentId ?? "",
      itemsSummary,
      o.shipping?.zonaLabel ?? "",
      o.shipping?.cost ?? "",
    ]
      .map(csvCell)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
