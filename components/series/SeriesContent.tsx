"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface SeriesContentProps {
  label: string;
  statement?: string;
}

export function SeriesContent({ label, statement }: SeriesContentProps) {
  return (
    <div className="pt-6 md:pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/series"
          className="text-sm tracking-widest text-stone hover:text-accent mb-8 inline-block"
        >
          ← Series
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-light"
        >
          {label}
        </motion.h1>
        {statement ? (
          <p className="mb-14 mt-5 max-w-3xl text-base leading-relaxed text-charcoal/80 md:text-lg">
            {statement}
          </p>
        ) : (
          <div className="mb-16" />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="max-w-sm overflow-hidden rounded-lg border border-charcoal/10 bg-cream p-0 shadow-sm transition-all duration-300 hover:border-charcoal/20 hover:shadow-md"
            >
              <div className="overflow-hidden rounded-t-lg">
                <div className="relative aspect-[3/4] bg-charcoal/[0.04]">
                  <div className="absolute inset-0 bg-charcoal/5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
