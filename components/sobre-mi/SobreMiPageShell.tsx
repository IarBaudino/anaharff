"use client";

import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { SITE_PAGE_SHELL } from "@/lib/layout-constants";
import type { ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  sectionId?: string;
  children: ReactNode;
};

/** Bio, currículo y páginas similares: título arriba del contenido. */
export function SobreMiPageShell({ kicker, title, sectionId, children }: Props) {
  return (
    <div className={SITE_PAGE_SHELL}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-b border-charcoal/10 pb-8 md:pb-10"
        >
          <p className="section-kicker mb-4">{kicker}</p>
          <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <SectionDivider variant="line" className="mt-8" />
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          id={sectionId}
          className="pt-8 md:pt-10"
        >
          {children}
        </motion.section>
      </div>
    </div>
  );
}
