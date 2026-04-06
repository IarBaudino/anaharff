"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Mail } from "lucide-react";
import { SITE_INSTAGRAM_URL } from "@/lib/site-links";

const iconClass =
  "shrink-0 rounded-full p-2.5 text-charcoal/75 transition-colors hover:bg-charcoal/[0.06] hover:text-charcoal sm:p-3";

/** Misma idea que la barra de iconos + título, integrada en el hero (encima de las dos líneas). */
export function HomeHeroTitle({ titulo }: { titulo: string }) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-5 sm:px-6 sm:pb-6 lg:px-10 lg:pb-8">
      <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
        <Link
          href={SITE_INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={iconClass}
          aria-label="Instagram"
        >
          <Instagram className="size-[1.15rem] sm:size-6" strokeWidth={1.65} />
        </Link>

        <div className="min-w-0 flex-1 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-light tracking-tight text-charcoal sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.25rem] xl:leading-[1.06]"
          >
            {titulo}
          </motion.h1>
        </div>

        <Link href="/contacto" className={iconClass} aria-label="Formulario de contacto">
          <Mail className="size-[1.15rem] sm:size-6" strokeWidth={1.65} />
        </Link>
      </div>
    </div>
  );
}
