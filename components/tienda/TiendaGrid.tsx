"use client";

import { motion } from "framer-motion";
import { ImageCard } from "./ImageCard";
import type { StoreItem } from "@/lib/site-content";

export function TiendaGrid({ items }: { items: StoreItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-10">
      {items.map((img, i) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 + i * 0.04, duration: 0.45 }}
          className="min-w-0"
        >
          <ImageCard item={img} />
        </motion.div>
      ))}
    </div>
  );
}
