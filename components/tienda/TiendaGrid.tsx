"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageCard } from "./ImageCard";
import { defaultSiteContent } from "@/lib/site-content";

export interface ImagenTienda {
  id: string;
  titulo: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
}

const imagenesEjemplo: ImagenTienda[] = defaultSiteContent.tienda.items;

export function TiendaGrid({ items }: { items?: ImagenTienda[] }) {
  const [imagenes] = useState<ImagenTienda[]>(items && items.length ? items : imagenesEjemplo);

  return (
    <div className="grid grid-cols-1 justify-items-center gap-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12">
      {imagenes.map((img, i) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <ImageCard imagen={img} />
        </motion.div>
      ))}
    </div>
  );
}
