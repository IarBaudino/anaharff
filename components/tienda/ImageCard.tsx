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
    <Card as="article" className="max-w-none">
      <div className="overflow-hidden rounded-t-lg">
        <div className="relative aspect-[3/4] overflow-hidden bg-charcoal/[0.04]">
          {tieneImagen ? (
            <Image
              src={imagen.imagenUrl!}
              fill
              alt={imagen.titulo}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone/40 text-xs tracking-widest uppercase">Imagen</span>
            </div>
          )}
        </div>
      </div>
      <CardContent>
        <h2 className="mb-2 font-display text-2xl font-semibold tracking-tight text-charcoal">
          {imagen.titulo}
        </h2>
        {imagen.descripcion && (
          <p className="mb-6 text-stone">{imagen.descripcion}</p>
        )}
        <p className="mb-6 text-base font-medium text-charcoal">
          ${imagen.precio.toLocaleString("es-AR")} ARS
        </p>
        <CheckoutButton imagen={imagen} />
      </CardContent>
    </Card>
  );
}
