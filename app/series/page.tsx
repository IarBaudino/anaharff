"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const series = [
  { slug: "unica", label: "Unica" },
  { slug: "ser-gorda", label: "Ser Gorda" },
  { slug: "venus-as-a-boy", label: "Venus as a Boy" },
  { slug: "desde-la-distancia", label: "Desde la Distancia" },
];

export default function SeriesPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-light mb-16"
        >
          Series
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {series.map((s, i) => (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="max-w-sm"
            >
              <Link
                href={`/series/${s.slug}`}
                className="group block overflow-hidden rounded-lg border border-charcoal/10 bg-cream p-0 shadow-sm transition-all duration-300 hover:border-charcoal/20 hover:shadow-md"
              >
                <div className="overflow-hidden rounded-t-lg">
                  <div className="relative aspect-[4/5] overflow-hidden bg-charcoal/[0.04]">
                    <div className="absolute inset-0 bg-charcoal/5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-stone/40 text-xs tracking-widest uppercase">{s.label}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="mb-2 font-display text-2xl font-semibold tracking-tight text-charcoal group-hover:text-accent transition-colors">
                    {s.label}
                  </h2>
                  <span className="inline-flex items-center text-sm font-medium text-stone">
                    Ver serie
                    <svg className="ms-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
