"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Download, Search } from "lucide-react";
import { db, isFirebaseConfigured } from "@/lib/firebase-client";
import type { OrderRecord, OrderStatus } from "@/lib/commerce-types";
import { orderStatusLabels } from "@/lib/order-labels";
import { downloadCsv, ordersToCsv } from "@/lib/orders-csv";
import { formatShippingAddressBlock } from "@/lib/shipping";

function formatDate(d: unknown) {
  if (!d) return "—";
  if (d instanceof Timestamp) {
    return d.toDate().toLocaleString("es-AR");
  }
  if (d instanceof Date) {
    return d.toLocaleString("es-AR");
  }
  return String(d);
}

function orderTimestamp(d: unknown): number {
  if (d instanceof Timestamp) return d.toMillis();
  if (d instanceof Date) return d.getTime();
  return 0;
}

const adminStatuses: OrderStatus[] = [
  "aprobado",
  "en_preparacion",
  "completado",
  "cancelado",
  "pendiente",
  "rechazado",
];

const statusFilterOptions: { value: "" | OrderStatus; label: string }[] = [
  { value: "", label: "Todos los estados" },
  ...adminStatuses.map((s) => ({ value: s, label: orderStatusLabels[s] })),
];

export function AdminOrders() {
  const [orders, setOrders] = useState<(OrderRecord & { id: string })[]>([]);
  const [selected, setSelected] = useState<(OrderRecord & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(200));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderRecord) }));
      setOrders(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toMs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      const ts = orderTimestamp(o.createdAt);
      if (fromMs !== null && ts < fromMs) return false;
      if (toMs !== null && ts > toMs) return false;
      if (!q) return true;
      const haystack = [
        o.id,
        o.customerEmail,
        o.payerName,
        o.mercadoPagoPaymentId,
        o.externalReference,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  function exportFiltered() {
    if (!filtered.length) return;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`pedidos-anaharff-${stamp}.csv`, ordersToCsv(filtered));
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="text-stone">
        No se puede mostrar el listado de pedidos: revisá la configuración del sitio.
      </p>
    );
  }

  if (loading) {
    return <p className="text-stone">Cargando pedidos…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-display text-2xl">Pedidos</h2>
        <p className="text-sm text-stone">
          Pedidos desde la tienda. Filtrá, buscá y exportá a CSV para tu operación diaria.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border border-charcoal/10 bg-cream/60 p-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm lg:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-widest text-stone">Buscar</span>
          <span className="relative flex">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Email, nombre, ID, MP…"
              className="w-full rounded border border-charcoal/20 bg-cream py-2 pl-9 pr-3 text-sm"
            />
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-widest text-stone">Estado</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | OrderStatus)}
            className="w-full rounded border border-charcoal/20 bg-cream px-3 py-2 text-sm"
          >
            {statusFilterOptions.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={exportFiltered}
            disabled={!filtered.length}
            className="inline-flex w-full items-center justify-center gap-2 rounded border border-charcoal/25 px-4 py-2 text-sm hover:bg-charcoal/5 disabled:opacity-50"
          >
            <Download className="size-4" />
            Exportar CSV ({filtered.length})
          </button>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-widest text-stone">Desde</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded border border-charcoal/20 bg-cream px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-widest text-stone">Hasta</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded border border-charcoal/20 bg-cream px-3 py-2 text-sm"
          />
        </label>
      </div>

      {orders.length === 0 ? (
        <p className="text-stone">Todavía no hay pedidos registrados.</p>
      ) : filtered.length === 0 ? (
        <p className="text-stone">Ningún pedido coincide con los filtros.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-charcoal/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-stone">
                <th className="p-3 font-normal">Fecha</th>
                <th className="p-3 font-normal">Estado</th>
                <th className="p-3 font-normal">Cliente</th>
                <th className="p-3 text-right font-normal">Total</th>
                <th className="p-3 font-normal">MP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer border-b border-charcoal/5 hover:bg-charcoal/[0.03]"
                  onClick={() => setSelected(o)}
                >
                  <td className="whitespace-nowrap p-3">{formatDate(o.createdAt)}</td>
                  <td className="p-3">{orderStatusLabels[o.status] ?? o.status}</td>
                  <td className="max-w-[200px] truncate p-3">
                    {o.customerEmail || o.payerName || "—"}
                  </td>
                  <td className="p-3 text-right">
                    ${Number(o.total).toLocaleString("es-AR")} {o.currency_id}
                  </td>
                  <td className="max-w-[120px] truncate p-3 font-mono text-xs text-stone">
                    {o.mercadoPagoPaymentId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onSaved={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function OrderDetail({
  order,
  onClose,
  onSaved,
}: {
  order: OrderRecord & { id: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notas, setNotas] = useState(order.notasAdmin ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!db) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status,
        notasAdmin: notas,
        updatedAt: Timestamp.now(),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border border-charcoal/10 bg-cream p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl">Pedido</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-stone hover:text-charcoal"
          >
            Cerrar
          </button>
        </div>
        <p className="break-all text-xs text-stone">ID: {order.id}</p>
        <div>
          <label className="mb-1 block text-xs tracking-widest">Estado interno</label>
          <select
            className="w-full border border-charcoal/20 bg-cream px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {adminStatuses.map((s) => (
              <option key={s} value={s}>
                {orderStatusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest">Notas (solo admin)</label>
          <textarea
            className="min-h-[100px] w-full border border-charcoal/20 bg-cream px-3 py-2"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-stone">Payer:</span> {order.payerName || "—"}
          </p>
          <p>
            <span className="text-stone">Email:</span> {order.customerEmail || "—"}
          </p>
          <p>
            <span className="text-stone">Usuario UID:</span> {order.customerUid || "—"}
          </p>
        </div>
        {order.shipping ? (
          <div className="rounded border border-charcoal/10 bg-cream/60 p-3 text-sm">
            <p className="mb-2 text-xs uppercase tracking-widest text-stone">Envío</p>
            <p className="mb-2">
              {order.shipping.zonaLabel} —{" "}
              {order.shipping.cost > 0
                ? `$${order.shipping.cost.toLocaleString("es-AR")} ARS`
                : "Sin cargo"}
            </p>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-charcoal/90">
              {formatShippingAddressBlock(order.shipping.address)}
            </pre>
          </div>
        ) : null}
        <ul className="space-y-2 border-t border-charcoal/10 pt-3 text-sm">
          {(order.items ?? []).map((item, i) => (
            <li key={i}>
              {item.title} × {item.quantity} — ${item.unit_price.toLocaleString("es-AR")}
            </li>
          ))}
        </ul>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="bg-charcoal px-6 py-2 text-xs uppercase tracking-widest text-cream disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button type="button" onClick={onClose} className="border border-charcoal/20 px-6 py-2 text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
