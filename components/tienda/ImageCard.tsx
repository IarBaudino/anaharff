"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";
import { ProductPreviewModal } from "./ProductPreviewModal";
import { productGalleryUrls, type StoreItem } from "@/lib/site-content";
import { isProductSoldOut, stockBadgeText } from "@/lib/stock";
import { cn } from "@/lib/utils";
import { siteButtonGhost, siteButtonSolid } from "@/lib/site-buttons";

interface ImageCardProps {
  item: StoreItem;
}

export function ImageCard({ item }: ImageCardProps) {
  const urls = productGalleryUrls(item);
  const [previewOpen, setPreviewOpen] = useState(false);
  const main = urls[0];
  const soldOut = isProductSoldOut(item);
  const stockLabel = stockBadgeText(item);

  return (
    <article className="group block w-full">
      <button
        type="button"
        disabled={urls.length === 0}
        onClick={() => setPreviewOpen(true)}
        className={cn(
          "relative block w-full overflow-hidden bg-charcoal/[0.05] text-left",
          "aspect-[4/5] disabled:cursor-default"
        )}
        aria-label={`Vista previa de ${item.titulo}`}
      >
        {main ? (
          <Image
            src={main}
            fill
            alt={item.titulo}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-charcoal/[0.07] via-charcoal/[0.03] to-transparent"
            aria-hidden
          />
        )}
        {urls.length > 0 ? (
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        ) : null}
        {urls.length > 0 ? (
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-cream/90 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-charcoal opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
            <Eye className="size-3.5" strokeWidth={1.75} aria-hidden />
            Vista previa
          </span>
        ) : null}
      </button>

      <div className="border-b border-charcoal/12 pb-5 pt-3">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="w-full text-left"
          disabled={urls.length === 0}
        >
          <h2 className="font-display text-xl font-light tracking-tight text-charcoal transition-colors group-hover:text-accent md:text-2xl">
            {item.titulo}
          </h2>
          <p className="mt-1 text-sm font-medium tabular-nums text-charcoal">
            ${item.precio.toLocaleString("es-AR")} ARS
          </p>
          {stockLabel ? (
            <p
              className={cn(
                "mt-1 text-xs uppercase tracking-wide",
                soldOut ? "text-red-700" : "text-stone"
              )}
            >
              {stockLabel}
            </p>
          ) : null}
        </button>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <AddToCartButton
            item={item}
            disabled={soldOut}
            className={cn(siteButtonGhost, "w-full sm:w-auto")}
          />
          {soldOut ? (
            <span
              className={cn(
                siteButtonSolid,
                "inline-flex w-full cursor-not-allowed items-center justify-center opacity-50 sm:w-auto"
              )}
              aria-disabled
            >
              Agotado
            </span>
          ) : (
            <Link
              href="/tienda/carrito"
              className={cn(
                siteButtonSolid,
                "inline-flex w-full items-center justify-center sm:w-auto"
              )}
            >
              Comprar
            </Link>
          )}
        </div>
      </div>

      <ProductPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        titulo={item.titulo}
        descripcion={item.descripcion}
        precio={item.precio}
        urls={urls}
      />
    </article>
  );
}
