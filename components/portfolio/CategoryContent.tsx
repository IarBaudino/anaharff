"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SITE_PAGE_SHELL_COMPACT } from "@/lib/layout-constants";
import { PhotoMasonryGallery } from "@/components/ui/PhotoMasonryGallery";

interface CategoryContentProps {
  label: string;
  /** Enlace del texto «volver» (por defecto galería). */
  backHref?: string;
  /** URLs públicas de imágenes (Supabase Storage, etc.). */
  imageUrls: string[];
}

export function CategoryContent({
  label,
  backHref = "/galeria",
  imageUrls,
}: CategoryContentProps) {
  const urls = imageUrls.filter(Boolean);

  return (
    <div className={SITE_PAGE_SHELL_COMPACT}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="mb-8 inline-block text-sm tracking-widest text-stone hover:text-accent"
        >
          ← {backHref === "/galeria" ? "Portfolio" : "Volver"}
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display mb-12 text-4xl font-light tracking-tight md:text-5xl lg:text-6xl"
        >
          {label}
        </motion.h1>

        {urls.length === 0 ? (
          <div
            className="mx-auto max-w-xl rounded-lg border border-charcoal/10 bg-charcoal/[0.02] py-20"
            aria-hidden
          />
        ) : (
          <PhotoMasonryGallery
            imageUrls={urls}
            className="lg:columns-2 lg:gap-10"
            imageSizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
      </div>
    </div>
  );
}
