"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface CategoryContentProps {
  label: string;
}

export function CategoryContent({ label }: CategoryContentProps) {
  return (
    <div className="pt-6 md:pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/portfolio"
          className="text-sm tracking-widest text-stone hover:text-accent mb-8 inline-block"
        >
          ← Portfolio
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-light mb-16"
        >
          {label}
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group max-w-sm overflow-hidden rounded-lg border border-charcoal/10 bg-cream p-0 shadow-sm transition-all duration-300 hover:border-charcoal/20 hover:shadow-md cursor-pointer"
            >
              <div className="overflow-hidden rounded-t-lg">
                <div className="relative aspect-[3/4] overflow-hidden bg-charcoal/[0.04]">
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
