"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";

export default function SeriesPage() {
  const { content } = useSiteContent();
  const series = content?.series.projects?.length
    ? content.series.projects
    : defaultSiteContent.series.projects;

  return (
    <div className="pt-6 md:pt-24 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 md:mb-14"
        >
          <p className="section-kicker mb-3">Proyectos</p>
          <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:text-6xl">
            Series
          </h1>
          <SectionDivider variant="double" className="mt-8 max-w-xl" />
        </motion.header>

        <div className="grid grid-cols-1 gap-5 border-t border-charcoal/10 pt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-12 lg:gap-8 lg:pt-12">
          {series.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className={
                i === 0
                  ? "sm:col-span-2 lg:col-span-7"
                  : i === 1
                    ? "sm:col-span-2 lg:col-span-5"
                    : "sm:col-span-2 lg:col-span-6"
              }
            >
              <Link
                href={`/series/${s.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-charcoal/15 bg-cream shadow-sm transition-all duration-500 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-2xl before:bg-transparent before:transition-colors hover:border-charcoal/22 hover:shadow-md hover:before:bg-accent/90"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-charcoal/[0.04] sm:aspect-[16/11] lg:aspect-[4/5]">
                  <div className="absolute inset-0 bg-gradient-to-br from-charcoal/[0.06] to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <span className="text-center font-display text-2xl font-light text-charcoal/35 transition-colors group-hover:text-charcoal/55 md:text-3xl">
                      {s.label}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col border-t border-charcoal/5 p-6 md:p-7">
                  <h2 className="font-display text-xl font-light tracking-tight text-charcoal transition-colors group-hover:text-accent md:text-2xl">
                    {s.label}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal/75 md:text-base">
                    {s.statement}
                  </p>
                  <span className="mt-3 inline-flex items-center text-xs uppercase tracking-[0.2em] text-stone transition-colors group-hover:text-charcoal">
                    Ver serie
                    <svg
                      className="ms-2 h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m14 0-4 4m4-4-4-4" />
                    </svg>
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
