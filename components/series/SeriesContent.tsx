"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SITE_PAGE_SHELL_COMPACT } from "@/lib/layout-constants";
import { PhotoMasonryGallery } from "@/components/ui/PhotoMasonryGallery";

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
    <div className={SITE_PAGE_SHELL_COMPACT}>
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
          <PhotoMasonryGallery imageUrls={urls} />
        )}
      </div>
    </div>
  );
}
