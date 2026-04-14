"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";

export default function PortfolioPage() {
  const { content } = useSiteContent();
  const categories = content?.portfolio.categories?.length
    ? content.portfolio.categories
    : defaultSiteContent.portfolio.categories;

  return (
    <div className="pt-6 md:pt-24 pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 pb-8 md:mb-12 md:pb-10"
        >
          <p className="section-kicker mb-3">Galerías</p>
          <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:text-6xl">
            Portfolio
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal/75">
            Series y categorías. Cada enlace abre una línea de trabajo.
          </p>
          <SectionDivider variant="line" className="mt-10" />
          <SectionDivider variant="double" className="mt-3 opacity-80" />
        </motion.header>

        <div className="space-y-0">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }}
            >
              <Link
                href={`/portfolio/${cat.slug}`}
                className="group relative flex flex-col gap-4 border-b border-charcoal/15 py-10 pl-4 transition-colors first:pt-0 hover:border-accent/35 md:flex-row md:items-baseline md:gap-12 md:py-12 md:pl-5 before:absolute before:inset-y-8 before:left-0 before:w-px before:bg-charcoal/12 before:transition-colors group-hover:before:bg-accent group-hover:before:w-0.5 md:before:inset-y-10"
              >
                <span className="shrink-0 font-display text-3xl font-light tabular-nums text-stone/50 transition-colors group-hover:text-accent md:w-16 md:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-2xl font-light tracking-tight text-charcoal transition-colors group-hover:text-accent md:text-3xl">
                    {cat.label}
                  </h2>
                  <span className="mt-2 inline-block text-xs uppercase tracking-[0.2em] text-stone transition-colors group-hover:text-charcoal">
                    Ver galería
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
