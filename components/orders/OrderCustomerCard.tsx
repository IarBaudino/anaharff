"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { OrderRecord } from "@/lib/commerce-types";
import {
  orderStatusBadgeClass,
  orderStatusCustomerHint,
  orderStatusLabels,
} from "@/lib/order-labels";
import { formatShippingAddressBlock } from "@/lib/shipping";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

function formatDate(d: unknown) {
  if (!d) return "—";
  if (d instanceof Timestamp) return d.toDate().toLocaleString("es-AR");
  if (d instanceof Date) return d.toLocaleString("es-AR");
  return String(d);
}

export function OrderCustomerCard({ order }: { order: OrderRecord & { id: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-lg border border-charcoal/10 bg-cream/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-stone">{formatDate(order.createdAt)}</p>
          <p className="mt-1 text-xs text-stone">Pedido #{order.id.slice(0, 8)}…</p>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide",
            orderStatusBadgeClass(order.status)
          )}
        >
          {orderStatusLabels[order.status] ?? order.status}
        </span>
      </div>

      <p className="mt-3 text-lg font-medium text-charcoal">
        ${Number(order.total).toLocaleString("es-AR")}{" "}
        <span className="text-sm font-normal text-stone">{order.currency_id}</span>
      </p>

      <p className="mt-2 text-sm text-charcoal/80">{orderStatusCustomerHint[order.status]}</p>

      <ul className="mt-4 space-y-2 border-t border-charcoal/10 pt-4 text-sm text-charcoal/90">
        {order.items.map((it, idx) => (
          <li key={`${order.id}-${it.id}-${idx}`} className="flex justify-between gap-4">
            <span>
              {it.title} ×{it.quantity}
            </span>
            <span className="shrink-0 text-stone">
              ${(it.unit_price * it.quantity).toLocaleString("es-AR")}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-accent underline-offset-2 hover:underline"
      >
        {open ? "Ocultar detalle" : "Ver detalle"}
        {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>

      {open ? (
        <div className="mt-4 space-y-3 rounded-lg border border-charcoal/10 bg-cream/60 p-4 text-sm">
          {order.shipping ? (
            <div>
              <p className="text-xs uppercase tracking-widest text-stone">Envío</p>
              <p className="mt-1">
                {order.shipping.zonaLabel}
                {order.shipping.cost > 0
                  ? ` — $${order.shipping.cost.toLocaleString("es-AR")} ARS`
                  : " — sin cargo"}
              </p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-charcoal/85">
                {formatShippingAddressBlock(order.shipping.address)}
              </pre>
            </div>
          ) : (
            <p className="text-stone">Sin datos de envío registrados.</p>
          )}
          {order.mercadoPagoPaymentId ? (
            <p>
              <span className="text-stone">Pago Mercado Pago:</span>{" "}
              <span className="font-mono text-xs">{order.mercadoPagoPaymentId}</span>
            </p>
          ) : null}
          <p className="text-xs text-stone">
            Referencia interna: <span className="font-mono">{order.id}</span>
          </p>
        </div>
      ) : null}
    </li>
  );
}
