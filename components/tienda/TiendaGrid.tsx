"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageCard } from "./ImageCard";

export interface ImagenTienda {
  id: string;
  titulo: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
}

// Datos hardcodeados - reemplazar por CMS/Cloudinary cuando esté configurado
const imagenesEjemplo: ImagenTienda[] = [
  { id: "1", titulo: "Serie Unica - #1", descripcion: "Fotografía analógica 35mm", precio: 15000, imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=1" },
  { id: "2", titulo: "Serie Unica - #2", descripcion: "Fotografía analógica 35mm", precio: 15000, imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=2" },
  { id: "3", titulo: "Retrato - #1", descripcion: "Impresión fine art", precio: 25000, imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=3" },
  { id: "4", titulo: "Retrato - #2", descripcion: "Impresión fine art", precio: 25000, imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=4" },
  { id: "5", titulo: "Experimental - #1", descripcion: "Edición limitada", precio: 18000, imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=5" },
  { id: "6", titulo: "Experimental - #2", descripcion: "Edición limitada", precio: 18000, imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=6" },
];

export function TiendaGrid() {
  const [imagenes] = useState<ImagenTienda[]>(imagenesEjemplo);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
