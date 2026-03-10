"use client";

import { ChevronRight } from "lucide-react";
import { ImagenTienda } from "./TiendaGrid";

interface CheckoutButtonProps {
  imagen: ImagenTienda;
}

const TIENDA_HABILITADA = false;

export function CheckoutButton({ imagen }: CheckoutButtonProps) {
  if (!TIENDA_HABILITADA) {
    return (
      <button
        disabled
        className="inline-flex items-center rounded-lg border border-charcoal/20 bg-cream px-4 py-2.5 text-sm font-medium leading-5 text-stone shadow-sm cursor-not-allowed"
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
        if (data.initPoint) window.location.href = data.initPoint;
        else if (data.preferenceId) window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.preferenceId}`;
      }}
      className="inline-flex items-center rounded-lg border border-charcoal/20 bg-cream px-4 py-2.5 text-sm font-medium leading-5 text-charcoal shadow-sm transition-colors hover:bg-charcoal/5 hover:text-charcoal focus:outline-none focus:ring-4 focus:ring-charcoal/10"
    >
      Comprar con MercadoPago
      <ChevronRight className="ms-1.5 h-4 w-4" />
    </button>
  );
}
