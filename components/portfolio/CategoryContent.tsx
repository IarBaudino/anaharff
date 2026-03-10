"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface CategoryContentProps {
  label: string;
}

export function CategoryContent({ label }: CategoryContentProps) {
  return (
    <div className="pt-24 pb-20">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="aspect-[3/4] bg-charcoal/10 group cursor-pointer"
            >
              <div className="w-full h-full bg-charcoal/5 group-hover:bg-charcoal/10 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
