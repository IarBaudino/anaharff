"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface CategoryContentProps {
  label: string;
  /** Enlace del texto «volver» (por defecto galería). */
  backHref?: string;
  /** URLs públicas de imágenes (Cloudinary, etc.). */
  imageUrls: string[];
}

export function CategoryContent({
  label,
  backHref = "/galeria",
  imageUrls,
}: CategoryContentProps) {
  const urls = imageUrls.filter(Boolean);

  return (
    <div className="pb-20 pt-6 md:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="mb-8 inline-block text-sm tracking-widest text-stone hover:text-accent"
        >
          ← {backHref === "/galeria" ? "Galería" : "Volver"}
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display mb-12 text-4xl font-light tracking-tight md:text-5xl"
        >
          {label}
        </motion.h1>

        {urls.length === 0 ? (
          <div
            className="mx-auto max-w-xl rounded-lg border border-charcoal/10 bg-charcoal/[0.02] py-20"
            aria-hidden
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {urls.map((src, i) => (
              <motion.div
                key={`${src}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className="overflow-hidden rounded-lg border border-charcoal/10 bg-cream shadow-sm transition-shadow hover:border-charcoal/20 hover:shadow-md"
              >
                <div className="relative aspect-[4/5] w-full bg-charcoal/[0.03] p-2 md:p-3">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
