"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";

export default function HomePage() {
  const { content } = useSiteContent();
  const home = content?.home ?? defaultSiteContent.home;

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-charcoal mb-8">
            {home.titulo}
          </h1>
          <p className="text-lg md:text-xl text-charcoal/90 leading-relaxed mb-6">
            {home.parrafoEs}
          </p>
          <p className="text-base md:text-lg text-stone italic leading-relaxed">
            {home.parrafoEn}
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portfolio"
              className="px-8 py-3 border border-charcoal text-charcoal text-sm tracking-widest uppercase hover:bg-charcoal hover:text-cream transition-colors"
            >
              Ver portfolio
            </Link>
            <Link
              href="/tienda"
              className="px-8 py-3 bg-charcoal text-cream text-sm tracking-widest uppercase hover:bg-ink transition-colors"
            >
              Tienda
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured images grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-charcoal/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="max-w-sm"
            >
              <Link
                href="/portfolio"
                className="group block overflow-hidden rounded-lg border border-charcoal/10 bg-cream p-0 shadow-sm transition-all duration-300 hover:border-charcoal/20 hover:shadow-md"
              >
                <div className="overflow-hidden rounded-t-lg">
                  <div className="relative aspect-[3/4] overflow-hidden bg-charcoal/[0.04]">
                    <div className="absolute inset-0 bg-charcoal/5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
