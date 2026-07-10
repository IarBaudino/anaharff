"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import type { CheckoutLineItem, OrderShipping } from "@/lib/commerce-types";
import { MP_CHECKOUT_MARKER_KEY } from "@/lib/mp-checkout-marker";
import { SHIPPING_LINE_ITEM_ID } from "@/lib/shipping";
import { productGalleryUrls, type StoreItem } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  item?: StoreItem;
  items?: CheckoutLineItem[];
  shipping?: OrderShipping;
  /** Si es true, solo usuarios logueados pueden pagar. */
  requireAuth?: boolean;
  /** Validación / guardado antes de crear la preferencia. */
  onBeforeCheckout?: () => void | Promise<void>;
  /** "cart": al aprobar el pago se vacía el carrito. "direct": solo se descuentan las líneas pagadas. */
  checkoutScope?: "cart" | "direct";
  label?: string;
  disabled?: boolean;
  className?: string;
  // eslint-disable-next-line no-unused-vars
  onSuccessRedirect?: (_url: string) => void;
}

const TIENDA_HABILITADA = process.env.NEXT_PUBLIC_TIENDA_ENABLED !== "false";

export function CheckoutButton({
  item,
  items,
  shipping,
  requireAuth = false,
  onBeforeCheckout,
  checkoutScope = "direct",
  label = "Comprar",
  disabled = false,
  className,
  onSuccessRedirect,
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!TIENDA_HABILITADA) {
    return (
      <button
        type="button"
        disabled
        title="La tienda no está activa en este momento."
        className="inline-flex cursor-not-allowed items-center rounded-full border border-charcoal/20 bg-cream px-5 py-2.5 text-sm font-medium leading-5 text-charcoal/45 shadow-sm"
      >
        {label}
        <ChevronRight className="ms-1.5 h-4 w-4" />
      </button>
    );
  }

  if (requireAuth && !user) {
    return (
      <Link
        href="/cuenta/ingresar?next=/tienda/carrito"
        className={cn(
          "inline-flex items-center rounded-full border border-charcoal/25 bg-cream px-5 py-2.5 text-sm font-medium leading-5 text-charcoal shadow-sm transition-colors hover:border-charcoal/40 hover:bg-charcoal/[0.06]",
          className
        )}
      >
        Ingresá para comprar
        <ChevronRight className="ms-1.5 h-4 w-4" />
      </Link>
    );
  }

  const checkoutItems: CheckoutLineItem[] =
    items && items.length
      ? items
      : item
        ? (() => {
            const pics = productGalleryUrls(item);
            return [
              {
                id: item.id,
                title: item.titulo,
                quantity: 1,
                unit_price: item.precio,
                currency_id: "ARS",
                description: item.descripcion || "Impresión fotográfica - Ana Harff",
                picture_url: pics[0],
              },
            ];
          })()
        : [];

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || loading || checkoutItems.length === 0}
        onClick={async () => {
          if (checkoutItems.length === 0) return;
          setError(null);
          setLoading(true);
          try {
            try {
              await onBeforeCheckout?.();
            } catch (beforeErr) {
              const msg =
                beforeErr instanceof Error && beforeErr.message
                  ? beforeErr.message
                  : "Revisá los datos de envío.";
              setError(msg);
              return;
            }

            const res = await fetch("/api/mercadopago/create-preference", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customerUid: user?.uid ?? null,
                customerEmail: user?.email ?? null,
                items: checkoutItems,
                shipping: shipping ?? null,
              }),
            });
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
              initPoint?: string;
              preferenceId?: string;
            };
            if (!res.ok) {
              setError(data.error || "No se pudo iniciar el pago. Probá de nuevo.");
              return;
            }
            const url =
              data.initPoint ||
              (data.preferenceId
                ? `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.preferenceId}`
                : null);
            if (!url) {
              setError("No se pudo iniciar el pago. Revisá la configuración de Mercado Pago.");
              return;
            }
            try {
              const marker =
                checkoutScope === "cart"
                  ? { v: 1 as const, mode: "cart" as const }
                  : {
                      v: 1 as const,
                      mode: "direct" as const,
                      lines: checkoutItems
                        .filter((i) => i.id !== SHIPPING_LINE_ITEM_ID)
                        .map((i) => ({
                          id: String(i.id),
                          q: Math.max(1, Math.round(i.quantity || 1)),
                        })),
                    };
              sessionStorage.setItem(MP_CHECKOUT_MARKER_KEY, JSON.stringify(marker));
            } catch {
              /* private mode / quota */
            }
            if (onSuccessRedirect) onSuccessRedirect(url);
            else window.location.href = url;
          } catch {
            setError("No se pudo conectar con el pago. Revisá tu conexión e intentá de nuevo.");
          } finally {
            setLoading(false);
          }
        }}
        className={cn(
          "inline-flex items-center rounded-full border border-charcoal/25 bg-cream px-5 py-2.5 text-sm font-medium leading-5 text-charcoal shadow-sm transition-colors hover:border-charcoal/40 hover:bg-charcoal/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        {loading ? "Conectando…" : label}
        {!loading ? <ChevronRight className="ms-1.5 h-4 w-4" /> : null}
      </button>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
