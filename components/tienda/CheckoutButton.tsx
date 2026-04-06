"use client";

import { ChevronRight } from "lucide-react";
import { ImagenTienda } from "./TiendaGrid";
import { useAuth } from "@/components/AuthProvider";

interface CheckoutButtonProps {
  imagen: ImagenTienda;
}

const TIENDA_HABILITADA = process.env.NEXT_PUBLIC_TIENDA_ENABLED !== "false";

export function CheckoutButton({ imagen }: CheckoutButtonProps) {
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

  return (
    <button
      onClick={async () => {
        const res = await fetch("/api/mercadopago/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerUid: user?.uid ?? null,
            customerEmail: user?.email ?? null,
            items: [
              {
                id: imagen.id,
                title: imagen.titulo,
                quantity: 1,
                unit_price: imagen.precio,
                description: imagen.descripcion || "Fotografía analógica - Ana Harff",
                picture_url: imagen.imagenUrl,
              },
            ],
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "No se pudo iniciar el pago");
          return;
        }
        if (data.initPoint) window.location.href = data.initPoint;
        else if (data.preferenceId)
          window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.preferenceId}`;
      }}
      className="inline-flex items-center rounded-full border border-charcoal/25 bg-cream px-5 py-2.5 text-sm font-medium leading-5 text-charcoal shadow-sm transition-colors hover:border-charcoal/40 hover:bg-charcoal/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15"
    >
      Comprar con MercadoPago
      <ChevronRight className="ms-1.5 h-4 w-4" />
    </button>
  );
}
