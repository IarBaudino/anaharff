"use client";

import { motion } from "framer-motion";
import { TiendaGrid } from "@/components/tienda/TiendaGrid";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";

export default function TiendaPage() {
  const { content } = useSiteContent();
  const tienda = content?.tienda ?? defaultSiteContent.tienda;

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-light mb-4">
            {tienda.titulo}
          </h1>
          <p className="text-charcoal/80 max-w-xl">
            {tienda.descripcion}
          </p>
        </motion.div>

        <TiendaGrid items={tienda.items} />
      </div>
    </div>
  );
}
