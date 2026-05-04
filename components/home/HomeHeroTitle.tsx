"use client";

import { motion } from "framer-motion";

/** Título principal del inicio (sin iconos: IG y contacto van en la barra de navegación). */
export function HomeHeroTitle({ titulo }: { titulo: string }) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-5 sm:px-6 sm:pb-6 lg:px-10 lg:pb-8">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl font-light tracking-tight text-charcoal sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.25rem] xl:leading-[1.06]"
        >
          {titulo}
        </motion.h1>
      </div>
    </div>
  );
}
