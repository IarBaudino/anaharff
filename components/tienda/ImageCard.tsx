"use client";

import Image from "next/image";
import { ImagenTienda } from "./TiendaGrid";
import { CheckoutButton } from "./CheckoutButton";

interface ImageCardProps {
  imagen: ImagenTienda;
}

export function ImageCard({ imagen }: ImageCardProps) {
  const tieneImagen = imagen.imagenUrl && imagen.imagenUrl.length > 0;

  return (
    <article className="group">
      <div className="aspect-[3/4] bg-charcoal/10 overflow-hidden mb-4">
        {tieneImagen ? (
          <Image
            src={imagen.imagenUrl!}
            width={600}
            height={800}
            alt={imagen.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-charcoal/5 group-hover:bg-charcoal/10 transition-colors flex items-center justify-center">
            <span className="text-stone/50 text-sm">Imagen</span>
          </div>
        )}
      </div>
      <h2 className="font-display text-xl font-light mb-1">{imagen.titulo}</h2>
      {imagen.descripcion && (
        <p className="text-sm text-stone mb-3">{imagen.descripcion}</p>
      )}
      <p className="text-lg font-medium mb-4">
        ${imagen.precio.toLocaleString("es-AR")} ARS
      </p>
      <CheckoutButton imagen={imagen} />
    </article>
  );
}
