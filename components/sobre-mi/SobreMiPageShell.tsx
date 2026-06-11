"use client";

import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import type { ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  sectionId?: string;
  children: ReactNode;
};

export function SobreMiPageShell({ kicker, title, sectionId, children }: Props) {
  return (
    <div className="pb-24 pt-6 md:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 lg:pt-2"
          >
            <p className="section-kicker mb-4">{kicker}</p>
            <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:sticky lg:top-28">
              {title}
            </h1>
            <SectionDivider variant="line" className="mt-8 hidden lg:block" />
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            id={sectionId}
            className="border-charcoal/10 lg:col-span-8 lg:border-l-2 lg:border-charcoal/15 lg:pl-10 xl:pl-12"
          >
            <SectionDivider variant="double" className="mb-10 lg:hidden" />
            {children}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
