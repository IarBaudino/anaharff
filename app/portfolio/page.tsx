"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  { href: "/portfolio/desnudos", label: "Desnudos (nude)" },
  { href: "/portfolio/retratos", label: "Retratos (portrait)" },
  { href: "/portfolio/artistico", label: "Artístico (art & shows)" },
  { href: "/portfolio/experimental", label: "Experimental" },
];

export default function PortfolioPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-light mb-16"
        >
          Portfolio
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={cat.href}
                className="group block border-b border-charcoal/20 pb-6 hover:border-accent transition-colors"
              >
                <h2 className="font-display text-2xl md:text-3xl font-light tracking-tight group-hover:text-accent transition-colors">
                  {cat.label}
                </h2>
                <span className="text-stone text-sm mt-2 inline-block group-hover:text-accent transition-colors">
                  Ver galería →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
