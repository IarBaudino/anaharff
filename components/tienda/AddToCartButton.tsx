"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagenTienda } from "./TiendaGrid";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function AddToCartButton({ imagen }: { imagen: ImagenTienda }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    addItem({
      id: imagen.id,
      title: imagen.titulo,
      unit_price: imagen.precio,
      description: imagen.descripcion || "Fotografía analógica - Ana Harff",
      picture_url: imagen.imagenUrl,
    });
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  }, [addItem, imagen]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2.5 text-sm font-medium leading-5 shadow-sm transition-colors",
        added
          ? "border-green-700/35 bg-green-50 text-green-900"
          : "border-charcoal/20 bg-cream text-charcoal hover:border-charcoal/40 hover:bg-charcoal/[0.06]"
      )}
    >
      {added ? (
        <>
          Agregado
          <Check className="ms-1.5 h-4 w-4" strokeWidth={2.25} />
        </>
      ) : (
        <>
          Agregar
          <ShoppingCart className="ms-1.5 h-4 w-4" />
        </>
      )}
    </button>
  );
}
