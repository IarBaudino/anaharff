"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  titulo: string;
  descripcion?: string;
  precio: number;
  urls: string[];
};

export function ProductPreviewModal({
  open,
  onClose,
  titulo,
  descripcion,
  precio,
  urls,
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, urls]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
    },
    [open, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (!open || urls.length === 0) return null;

  const src = urls[index] ?? urls[0];
  const detalle = descripcion?.trim();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-charcoal/15 bg-cream shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-charcoal/10 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="font-display text-lg font-light text-charcoal sm:text-xl">{titulo}</p>
            <p className="mt-1 text-sm font-medium tabular-nums text-charcoal">
              ${precio.toLocaleString("es-AR")} ARS
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-charcoal/70 transition-colors hover:bg-charcoal/10 hover:text-charcoal"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="relative aspect-[3/4] max-h-[55vh] w-full bg-charcoal/[0.04] sm:aspect-[4/5]">
          <Image src={src} alt="" fill className="object-contain p-4" sizes="100vw" priority />
        </div>
        {detalle ? (
          <div className="border-t border-charcoal/10 px-4 py-4 sm:px-5">
            <p className="text-xs uppercase tracking-widest text-stone">Detalle</p>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/90 whitespace-pre-wrap">
              {detalle}
            </p>
          </div>
        ) : null}
        {urls.length > 1 ? (
          <div className="flex flex-wrap gap-2 border-t border-charcoal/10 p-3">
            {urls.map((u, i) => (
              <button
                key={u}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-14 w-14 overflow-hidden rounded-md border-2 transition-colors",
                  i === index ? "border-accent" : "border-transparent hover:border-charcoal/25"
                )}
              >
                <Image src={u} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
