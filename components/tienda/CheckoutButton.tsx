"use client";

import { ChevronRight } from "lucide-react";
import { ImagenTienda } from "./TiendaGrid";
import { useAuth } from "@/components/AuthProvider";
import type { CheckoutLineItem } from "@/lib/commerce-types";
import { MP_CHECKOUT_MARKER_KEY } from "@/lib/mp-checkout-marker";

interface CheckoutButtonProps {
  imagen?: ImagenTienda;
  items?: CheckoutLineItem[];
  /** "cart": al aprobar el pago se vacía el carrito. "direct": solo se descuentan las líneas pagadas. */
  checkoutScope?: "cart" | "direct";
  label?: string;
  disabled?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSuccessRedirect?: (_url: string) => void;
}

const TIENDA_HABILITADA = process.env.NEXT_PUBLIC_TIENDA_ENABLED !== "false";

export function CheckoutButton({
  imagen,
  items,
  checkoutScope = "direct",
  label = "Comprar",
  disabled = false,
  onSuccessRedirect,
}: CheckoutButtonProps) {
  const { user } = useAuth();

  if (!TIENDA_HABILITADA) {
    return (
      <button
        disabled
        className="inline-flex cursor-not-allowed items-center rounded-full border border-charcoal/20 bg-cream px-5 py-2.5 text-sm font-medium leading-5 text-stone shadow-sm"
      >
        Próximamente
        <ChevronRight className="ms-1.5 h-4 w-4" />
      </button>
    );
  }

  const checkoutItems: CheckoutLineItem[] =
    items && items.length
      ? items
      : imagen
        ? [
            {
              id: imagen.id,
              title: imagen.titulo,
              quantity: 1,
              unit_price: imagen.precio,
              currency_id: "ARS",
              description: imagen.descripcion || "Fotografía analógica - Ana Harff",
              picture_url: imagen.imagenUrl,
            },
          ]
        : [];

  return (
    <button
      disabled={disabled || checkoutItems.length === 0}
      onClick={async () => {
        if (checkoutItems.length === 0) return;
        const res = await fetch("/api/mercadopago/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerUid: user?.uid ?? null,
            customerEmail: user?.email ?? null,
            items: checkoutItems,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "No se pudo iniciar el pago");
          return;
        }
        const url =
          data.initPoint ||
          (data.preferenceId
            ? `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.preferenceId}`
            : null);
        if (!url) {
          alert("No se pudo iniciar el pago");
          return;
        }
        try {
          const marker =
            checkoutScope === "cart"
              ? { v: 1 as const, mode: "cart" as const }
              : {
                  v: 1 as const,
                  mode: "direct" as const,
                  lines: checkoutItems.map((i) => ({
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
      }}
      className="inline-flex items-center rounded-full border border-charcoal/25 bg-cream px-5 py-2.5 text-sm font-medium leading-5 text-charcoal shadow-sm transition-colors hover:border-charcoal/40 hover:bg-charcoal/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
      <ChevronRight className="ms-1.5 h-4 w-4" />
    </button>
  );
}
