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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {series.map((s, i) => (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/series/${s.slug}`}
                className="group block"
              >
                <div className="aspect-[4/5] bg-charcoal/10 mb-4 group-hover:bg-charcoal/15 transition-colors" />
                <h2 className="font-display text-2xl font-light group-hover:text-accent transition-colors">
                  {s.label}
                </h2>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
