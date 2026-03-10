"use client";

import { ImagenTienda } from "./TiendaGrid";

interface CheckoutButtonProps {
  imagen: ImagenTienda;
}

// Hardcodeado: activar cuando MercadoPago esté configurado
const TIENDA_HABILITADA = false;

export function CheckoutButton({ imagen }: CheckoutButtonProps) {
  if (!TIENDA_HABILITADA) {
    return (
      <button
        disabled
        className="w-full px-6 py-3 bg-stone/30 text-stone text-sm tracking-widest uppercase cursor-not-allowed"
      >
        Próximamente
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
      className="w-full px-6 py-3 bg-charcoal text-cream text-sm tracking-widest uppercase hover:bg-ink transition-colors"
    >
      Comprar con MercadoPago
    </button>
  );
}
