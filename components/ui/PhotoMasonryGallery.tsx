"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PhotoMasonryGalleryProps = {
  imageUrls: string[];
  className?: string;
  imageSizes?: string;
};

/**
 * Grilla tipo mampostería: cada foto conserva su proporción (vertical, horizontal, cuadrada)
 * sin celdas fijas que dejen bandas vacías desparejas.
 */
export function PhotoMasonryGallery({
  imageUrls,
  className,
  imageSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: PhotoMasonryGalleryProps) {
  const urls = imageUrls.filter(Boolean);

  if (urls.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("columns-1 gap-6 sm:columns-2 md:gap-8 lg:columns-3", className)}
    >
      {urls.map((src, i) => (
        <motion.figure
          key={`${src}-${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: Math.min(i * 0.04, 0.4) }}
          className="mb-6 break-inside-avoid md:mb-8"
        >
          <Image
            src={src}
            alt=""
            width={0}
            height={0}
            sizes={imageSizes}
            className="h-auto w-full"
            style={{ width: "100%", height: "auto" }}
          />
        </motion.figure>
      ))}
    </motion.div>
  );
}
