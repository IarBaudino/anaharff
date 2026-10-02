"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { siteButtonSolid, siteButtonOutline } from "@/lib/site-buttons";
import { MP_CHECKOUT_MARKER_KEY } from "@/lib/mp-checkout-marker";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

function clearCartAfterCheckout() {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(MP_CHECKOUT_MARKER_KEY);
    if (raw) sessionStorage.removeItem(MP_CHECKOUT_MARKER_KEY);
  } catch {
    useCartStore.getState().clear();
    return;
  }
  if (!raw) {
    useCartStore.getState().clear();
    return;
  }

  try {
    const parsed = JSON.parse(raw) as {
      mode?: string;
      lines?: { id: string; q?: number }[];
    };
    if (parsed.mode === "cart" || !parsed.mode) {
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
    useCartStore.getState().clear();
  }
}

function resolvePaymentId(searchParams: URLSearchParams): string | null {
  const candidates = [
    searchParams.get("payment_id"),
    searchParams.get("collection_id"),
  ];
  for (const c of candidates) {
    if (c && /^\d+$/.test(c)) return c;
  }
  return null;
}

export function ExitoContent() {
  const searchParams = useSearchParams();
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const tried = useRef(false);
  const cartCleared = useRef(false);

  async function syncPayment(paymentId: string) {
    setSyncError(null);
    const res = await fetch("/api/orders/sync-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      created?: boolean;
      status?: string;
      orderId?: string;
      error?: string;
    };

    if (!res.ok || !data.ok) {
      setSyncError(
        data.error ||
          "No se pudo registrar el pedido en el sitio. Revisá FIREBASE_SERVICE_ACCOUNT_KEY en Vercel o reintentá."
      );
      return false;
    }

    if (data.status === "approved" && !cartCleared.current) {
      cartCleared.current = true;
      clearCartAfterCheckout();
    }
    if (data.orderId) setOrderId(data.orderId);
    setSyncMsg(
      data.created
        ? "Tu pedido quedó registrado. Podés verlo en tu cuenta."
        : "Pedido ya registrado."
    );
    return true;
  }

  useEffect(() => {
    const status =
      searchParams.get("status") ||
      searchParams.get("collection_status") ||
      searchParams.get("payment_status");
    const paymentId = resolvePaymentId(searchParams);

    const approved =
      status === "approved" ||
      (!status && Boolean(paymentId));

    if (approved && !cartCleared.current) {
      cartCleared.current = true;
      clearCartAfterCheckout();
    }

    if (!paymentId) {
      setSyncError(
        "Mercado Pago no devolvió el ID del pago en la URL. Buscá el pago en el panel de MP y sincronizalo desde Admin, o reintentá la compra."
      );
      return;
    }

    if (tried.current) return;
    tried.current = true;
    void syncPayment(paymentId);
  }, [searchParams]);

  const paymentId = resolvePaymentId(searchParams);

  return (
    <div className="flex min-h-[60vh] items-center justify-center pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md px-4 text-center"
      >
        <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
        <h1 className="mb-4 font-display text-2xl font-light md:text-3xl">¡Pago exitoso!</h1>
        <p className="mb-6 text-charcoal/80">
          Gracias por tu compra. Si el pedido no aparece abajo, reintentá la sincronización.
        </p>
        {paymentId ? (
          <p className="mb-3 font-mono text-xs text-stone">Pago MP: {paymentId}</p>
        ) : null}
        {orderId ? (
          <p className="mb-3 font-mono text-xs text-stone">Pedido: {orderId}</p>
        ) : null}
        {syncMsg ? <p className="mb-4 text-sm text-emerald-800">{syncMsg}</p> : null}
        {syncError ? (
          <p className="mb-4 text-sm text-red-700" role="alert">
            {syncError}
          </p>
        ) : null}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {paymentId ? (
            <button
              type="button"
              disabled={retrying}
              className={cn(siteButtonOutline, "disabled:opacity-50")}
              onClick={async () => {
                setRetrying(true);
                try {
                  await syncPayment(paymentId);
                } finally {
                  setRetrying(false);
                }
              }}
            >
              {retrying ? "Sincronizando…" : "Reintentar registrar pedido"}
            </button>
          ) : null}
          <Link href="/cuenta" className={siteButtonSolid}>
            Ver mis pedidos
          </Link>
        </div>
        <Link href="/tienda" className="mt-6 inline-block text-sm text-stone underline underline-offset-4">
          Volver a la tienda
        </Link>
      </motion.div>
    </div>
  );
}
