"use client";

import { motion } from "framer-motion";
import type { HomeTestimonio } from "@/lib/site-content";

export function HomeTestimoniosSection({
  kicker,
  titulo,
  items,
}: {
  kicker: string;
  titulo: string;
  items: HomeTestimonio[];
}) {
  const visibles = items.filter((t) => t.testimonio.trim() || t.nombre.trim());
  if (visibles.length === 0) return null;

  return (
    <section
      aria-labelledby="home-testimonios-heading"
      className="border-b border-charcoal/[0.1] bg-cream py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="section-kicker mb-2">{kicker}</p>
        <h2
          id="home-testimonios-heading"
          className="mb-12 max-w-3xl font-sans text-2xl font-normal tracking-tight text-charcoal md:mb-14 md:text-3xl"
        >
          {titulo}
        </h2>
        <ul className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-16">
          {visibles.map((t, i) => {
            const meta = t.trabajoRealizado?.trim();
            return (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-w-0 flex-col text-left"
              >
                {meta ? (
                  <>
                    <p className="text-[0.7rem] font-normal uppercase leading-relaxed tracking-[0.2em] text-stone">
                      {meta}
                    </p>
                    <div className="mt-3 h-px w-full bg-charcoal/20" aria-hidden />
                    <h3 className="mt-4 font-display text-xl font-light leading-snug text-charcoal md:text-2xl">
                      {t.nombre.trim() || "—"}
                    </h3>
                  </>
                ) : (
                  <h3 className="font-display text-xl font-light leading-snug text-charcoal md:text-2xl">
                    {t.nombre.trim() || "—"}
                  </h3>
                )}
                <p className="mt-5 font-sans text-sm font-normal leading-[1.75] text-charcoal/90 md:text-base">
                  {t.testimonio.trim() || "—"}
                </p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
