"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
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
            ANA HARFF
          </h1>
          <p className="text-lg md:text-xl text-charcoal/90 leading-relaxed mb-6">
            Abrazar la diversidad y la autenticidad es crucial para liberarnos de
            los estereotipos. Te invito a reflexionar sobre la importancia de la
            representación del cuerpo y a ser parte de una necesaria reflexión
            sobre la igualdad, la emancipación y la lucha por la autenticidad
            corporal.
          </p>
          <p className="text-base md:text-lg text-stone italic leading-relaxed">
            Embracing diversity and authenticity is crucial to liberate ourselves
            from stereotypes. I invite you to reflect on the importance of body
            representation and to be part of a necessary reflection about
            equality, emancipation and the struggle for body authenticity.
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

      {/* Featured images grid - placeholder until Cloudinary configured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-charcoal/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative aspect-[3/4] bg-charcoal/10 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              <Link href="/portfolio" className="block w-full h-full">
                <div className="w-full h-full bg-charcoal/5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
