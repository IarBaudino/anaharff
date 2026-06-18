"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import { productGalleryUrls, type StoreItem } from "@/lib/site-content";

export function AddToCartButton({
  item,
  className,
  disabled = false,
}: {
  item: StoreItem;
  className?: string;
  disabled?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pics = productGalleryUrls(item);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    addItem({
      id: item.id,
      title: item.titulo,
      unit_price: item.precio,
      description: item.descripcion || "Impresión fotográfica - Ana Harff",
      picture_url: pics[0],
    });
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  }, [addItem, disabled, item, pics]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2.5 text-sm font-medium leading-5 shadow-sm transition-colors",
        added
          ? "border-green-700/35 bg-green-50 text-green-900"
          : "border-charcoal/20 bg-cream text-charcoal hover:border-charcoal/40 hover:bg-charcoal/[0.06]",
        className
      )}
    >
      {added ? (
        <>
          Agregado
          <Check className="ms-1.5 h-4 w-4" strokeWidth={2.25} />
        </>
      ) : (
        <>
          Agregar al carrito
          <ShoppingCart className="ms-1.5 h-4 w-4" />
        </>
      )}
    </button>
  );
}
