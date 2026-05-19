"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PhotoMasonryGallery } from "@/components/ui/PhotoMasonryGallery";

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
          <PhotoMasonryGallery imageUrls={urls} />
        )}
      </div>
    </div>
  );
}
