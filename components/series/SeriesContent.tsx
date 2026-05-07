"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface SeriesContentProps {
  label: string;
  statement?: string;
  backHref?: string;
  imageUrls: string[];
}

export function SeriesContent({
  label,
  statement,
  backHref = "/series",
  imageUrls,
}: SeriesContentProps) {
  const urls = imageUrls.filter(Boolean);

  return (
    <div className="pb-20 pt-6 md:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="mb-8 inline-block text-sm tracking-widest text-stone hover:text-accent"
        >
          ← {backHref === "/series" ? "Series" : "Volver"}
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-light tracking-tight md:text-5xl"
        >
          {label}
        </motion.h1>
        {statement ? (
          <p className="mb-14 mt-5 max-w-3xl text-base leading-relaxed text-charcoal/80 md:text-lg">
            {statement}
          </p>
        ) : (
          <div className="mb-12" />
        )}

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
                className="max-w-sm overflow-hidden rounded-lg border border-charcoal/10 bg-cream shadow-sm transition-shadow hover:border-charcoal/20 hover:shadow-md sm:max-w-none"
              >
                <div className="relative aspect-[3/4] bg-charcoal/[0.03]">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
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
