"use client";

import Image from "next/image";
import { ImagenTienda } from "./TiendaGrid";
import { CheckoutButton } from "./CheckoutButton";
import { Card, CardContent } from "@/components/ui/Card";

interface ImageCardProps {
  imagen: ImagenTienda;
}

export function ImageCard({ imagen }: ImageCardProps) {
  const tieneImagen = imagen.imagenUrl && imagen.imagenUrl.length > 0;

  return (
    <Card
      as="article"
      className="relative max-w-[16.5rem] before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-[3px] before:rounded-l-xl before:bg-accent/0 before:transition-colors hover:before:bg-accent/90 sm:max-w-[17rem]"
    >
      <div className="overflow-hidden rounded-t-xl">
        <div className="relative aspect-[3/4] overflow-hidden bg-charcoal/[0.04]">
          {tieneImagen ? (
            <Image
              src={imagen.imagenUrl!}
              fill
              alt={imagen.titulo}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-2 transition-opacity duration-300 group-hover:opacity-95"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone/40 text-xs tracking-widest uppercase">Imagen</span>
            </div>
          )}
        </div>
      </div>
      <CardContent>
        <h2 className="mb-1.5 font-display text-xl font-semibold tracking-tight text-charcoal">
          {imagen.titulo}
        </h2>
        {imagen.descripcion && (
          <p className="mb-4 text-sm text-stone">{imagen.descripcion}</p>
        )}
        <p className="mb-4 text-sm font-medium text-charcoal">
          ${imagen.precio.toLocaleString("es-AR")} ARS
        </p>
        <CheckoutButton imagen={imagen} />
      </CardContent>
    </Card>
  );
}
