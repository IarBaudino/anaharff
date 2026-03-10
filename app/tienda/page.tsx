"use client";

import { motion } from "framer-motion";
import { TiendaGrid } from "@/components/tienda/TiendaGrid";

export default function TiendaPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-light mb-4">
            Tienda
          </h1>
          <p className="text-charcoal/80 max-w-xl">
            Imágenes en edición limitada. Fotografía analógica impresa o en formato digital de alta resolución.
          </p>
        </motion.div>

        <TiendaGrid />
      </div>
    </div>
  );
}
