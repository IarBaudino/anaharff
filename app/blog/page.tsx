"use client";

import { motion } from "framer-motion";

export default function BlogPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-light mb-16"
        >
          Blog
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-charcoal/80"
        >
          Próximamente: reflexiones, detrás de escena y textos sobre el proceso
          creativo.
        </motion.p>
      </div>
    </div>
  );
}
