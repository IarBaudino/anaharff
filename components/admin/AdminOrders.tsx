"use client";

import { useEffect, useState } from "react";
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
import { db, isFirebaseConfigured } from "@/lib/firebase-client";
import type { OrderRecord, OrderStatus } from "@/lib/commerce-types";

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

const statusLabels: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  en_preparacion: "En preparación",
  completado: "Completado",
  cancelado: "Cancelado",
};

const adminStatuses: OrderStatus[] = [
  "aprobado",
  "en_preparacion",
  "completado",
  "cancelado",
  "pendiente",
  "rechazado",
];

export function AdminOrders() {
  const [orders, setOrders] = useState<(OrderRecord & { id: string })[]>([]);
  const [selected, setSelected] = useState<(OrderRecord & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(80));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderRecord) }));
      setOrders(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (!isFirebaseConfigured) {
    return <p className="text-stone">Configurá Firebase para ver pedidos.</p>;
  }

  if (loading) {
    return <p className="text-stone">Cargando pedidos…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl mb-2">Pedidos</h2>
        <p className="text-sm text-stone">
          Órdenes generadas por MercadoPago (webhook o página de éxito). Podés actualizar estado
          interno y notas para entregas.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="text-stone">Todavía no hay pedidos registrados.</p>
      ) : (
        <div className="overflow-x-auto border border-charcoal/10 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-stone">
                <th className="p-3 font-normal">Fecha</th>
                <th className="p-3 font-normal">Estado</th>
                <th className="p-3 font-normal">Cliente</th>
                <th className="p-3 font-normal text-right">Total</th>
                <th className="p-3 font-normal">MP</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-charcoal/5 hover:bg-charcoal/[0.03] cursor-pointer"
                  onClick={() => setSelected(o)}
                >
                  <td className="p-3 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  <td className="p-3">{statusLabels[o.status] ?? o.status}</td>
                  <td className="p-3 max-w-[200px] truncate">
                    {o.customerEmail || o.payerName || "—"}
                  </td>
                  <td className="p-3 text-right">
                    ${Number(o.total).toLocaleString("es-AR")} {o.currency_id}
                  </td>
                  <td className="p-3 text-xs text-stone font-mono truncate max-w-[120px]">
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-charcoal/40 p-4">
      <div className="bg-cream border border-charcoal/10 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-display text-xl">Pedido</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone hover:text-charcoal text-sm"
          >
            Cerrar
          </button>
        </div>
        <p className="text-xs text-stone break-all">ID: {order.id}</p>
        <div>
          <label className="block text-xs tracking-widest mb-1">Estado interno</label>
          <select
            className="w-full px-3 py-2 border border-charcoal/20 bg-cream"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {adminStatuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs tracking-widest mb-1">Notas (solo admin)</label>
          <textarea
            className="w-full px-3 py-2 border border-charcoal/20 bg-cream min-h-[100px]"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
        <div className="text-sm space-y-1">
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
        <ul className="text-sm border-t border-charcoal/10 pt-3 space-y-2">
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
            className="px-6 py-2 bg-charcoal text-cream text-xs tracking-widest uppercase disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2 border border-charcoal/20 text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
