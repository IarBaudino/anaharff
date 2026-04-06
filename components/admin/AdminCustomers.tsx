"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase-client";
import type { CustomerRecord } from "@/lib/commerce-types";

function formatDate(d: unknown) {
  if (!d) return "—";
  if (d instanceof Timestamp) return d.toDate().toLocaleString("es-AR");
  if (d instanceof Date) return d.toLocaleString("es-AR");
  return String(d);
}

export function AdminCustomers() {
  const [rows, setRows] = useState<(CustomerRecord & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"), limit(100));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as CustomerRecord) })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <p className="text-stone">
        No se puede mostrar el listado de clientes: revisá la configuración del sitio.
      </p>
    );
  }

  if (loading) {
    return <p className="text-stone">Cargando clientes…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl mb-2">Clientes registrados</h2>
        <p className="text-sm text-stone">
          Personas que se registraron en el sitio. Las compras sin cuenta aparecen en pedidos con
          el correo que usaron al pagar.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-stone">No hay clientes registrados todavía.</p>
      ) : (
        <div className="overflow-x-auto border border-charcoal/10 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-stone">
                <th className="p-3 font-normal">Email</th>
                <th className="p-3 font-normal">Nombre</th>
                <th className="p-3 font-normal">Teléfono</th>
                <th className="p-3 font-normal">Registro</th>
                <th className="p-3 font-normal text-right">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-charcoal/5">
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.nombre || "—"}</td>
                  <td className="p-3">{c.telefono || "—"}</td>
                  <td className="p-3 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                  <td className="p-3 text-right">{c.ordersCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
