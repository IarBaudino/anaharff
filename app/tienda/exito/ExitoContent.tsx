"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { siteButtonSolid } from "@/lib/site-buttons";
import { MP_CHECKOUT_MARKER_KEY } from "@/lib/mp-checkout-marker";
import { useCartStore } from "@/stores/cart-store";

export function ExitoContent() {
  const searchParams = useSearchParams();
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const tried = useRef(false);
  const cartAfterPaymentApplied = useRef(false);

  useEffect(() => {
    const applyCartAfterApprovedPayment = (status: string | undefined) => {
      if (cartAfterPaymentApplied.current) return;
      if (status !== "approved") return;

      let raw: string | null = null;
      try {
        raw = sessionStorage.getItem(MP_CHECKOUT_MARKER_KEY);
        if (raw) sessionStorage.removeItem(MP_CHECKOUT_MARKER_KEY);
      } catch {
        return;
      }
      if (!raw) return;

      cartAfterPaymentApplied.current = true;

      try {
        const parsed = JSON.parse(raw) as {
          mode?: string;
          lines?: { id: string; q?: number }[];
        };
        if (parsed.mode === "cart") {
          useCartStore.getState().clear();
          return;
        }
        if (parsed.mode === "direct" && Array.isArray(parsed.lines)) {
          const merged = new Map<string, number>();
          for (const line of parsed.lines) {
            const id = String(line.id);
            const q = Math.max(0, Math.round(Number(line.q) || 0));
            if (q <= 0) continue;
            merged.set(id, (merged.get(id) ?? 0) + q);
          }
          const decrementBy = useCartStore.getState().decrementBy;
          merged.forEach((q, id) => decrementBy(id, q));
        }
      } catch {
        /* JSON inválido */
      }
    };

    const paymentId = searchParams.get("payment_id");
    if (!paymentId) {
      const urlOk =
        searchParams.get("status") === "approved" ||
        searchParams.get("collection_status") === "approved";
      if (urlOk) applyCartAfterApprovedPayment("approved");
      return;
    }

    if (tried.current) return;
    tried.current = true;

    fetch("/api/orders/sync-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          applyCartAfterApprovedPayment(typeof data.status === "string" ? data.status : undefined);
          setSyncMsg(
            data.created
              ? "Tu pedido quedó registrado en el panel de administración."
              : "Pedido ya registrado."
          );
        } else {
          setSyncMsg(
            "No se pudo sincronizar el pedido automáticamente (revisá en el panel más tarde)."
          );
        }
      })
      .catch(() => {
        setSyncMsg("No se pudo sincronizar el pedido automáticamente.");
      });
  }, [searchParams]);

  return (
    <div className="pt-6 md:pt-24 pb-20 min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md px-4"
      >
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h1 className="font-display text-2xl md:text-3xl font-light mb-4">
          ¡Pago exitoso!
        </h1>
        <p className="text-charcoal/80 mb-8">
          Gracias por tu compra. Recibirás un correo con los detalles de entrega
          de tu imagen.
        </p>
        {syncMsg && <p className="text-sm text-stone mb-6">{syncMsg}</p>}
        <Link href="/tienda" className={siteButtonSolid}>
          Volver a la tienda
        </Link>
      </motion.div>
    </div>
  );
}
