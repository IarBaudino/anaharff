"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye } from "lucide-react";
import { CheckoutButton } from "./CheckoutButton";
import { AddToCartButton } from "./AddToCartButton";
import { ProductPreviewModal } from "./ProductPreviewModal";
import { Card, CardContent } from "@/components/ui/Card";
import { productGalleryUrls, type StoreItem } from "@/lib/site-content";

interface ImageCardProps {
  item: StoreItem;
}

export function ImageCard({ item }: ImageCardProps) {
  const urls = productGalleryUrls(item);
  const [previewOpen, setPreviewOpen] = useState(false);
  const main = urls[0];

  return (
    <Card
      as="article"
      className="relative max-w-[16.5rem] before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-[3px] before:rounded-l-xl before:bg-accent/0 before:transition-colors hover:before:bg-accent/90 sm:max-w-[17rem]"
    >
      <div className="overflow-hidden rounded-t-xl">
        <div className="relative aspect-[3/4] overflow-hidden bg-charcoal/[0.04]">
          {main ? (
            <Image
              src={main}
              fill
              alt={item.titulo}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-2 transition-opacity duration-300 group-hover:opacity-95"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-charcoal/[0.07] via-charcoal/[0.03] to-transparent"
              aria-hidden
            />
          )}
        </div>
      </div>
      <CardContent>
        <h2 className="mb-1.5 font-display text-xl font-semibold tracking-tight text-charcoal">
          {item.titulo}
        </h2>
        {item.descripcion ? (
          <p className="mb-4 text-sm text-stone">{item.descripcion}</p>
        ) : null}
        <p className="mb-4 text-sm font-medium text-charcoal">
          ${item.precio.toLocaleString("es-AR")} ARS
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={urls.length === 0}
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center rounded-full border border-charcoal/20 bg-cream px-4 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-colors hover:border-charcoal/40 hover:bg-charcoal/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Vista previa
            <Eye className="ms-1.5 h-4 w-4" strokeWidth={2} />
          </button>
          <AddToCartButton item={item} />
          <CheckoutButton item={item} />
        </div>
      </CardContent>

      <ProductPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        titulo={item.titulo}
        urls={urls}
      />
    </Card>
  );
}
