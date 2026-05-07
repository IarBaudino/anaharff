"use client";

import { motion } from "framer-motion";
import { ImageCard } from "./ImageCard";
import type { StoreItem } from "@/lib/site-content";

export function TiendaGrid({ items }: { items: StoreItem[] }) {
  return (
    <div className="grid grid-cols-1 justify-items-center gap-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12">
      {items.map((img, i) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <ImageCard item={img} />
        </motion.div>
      ))}
    </div>
  );
}
