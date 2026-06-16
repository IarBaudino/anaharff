"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CategoryContent } from "@/components/portfolio/CategoryContent";
import { resolvePortfolioSubcategoryCover, type PortfolioCategory } from "@/lib/site-content";
import { SITE_PAGE_SHELL_COMPACT } from "@/lib/layout-constants";

type Props = {
  category: PortfolioCategory;
};

export function PortfolioCategoryClient({ category }: Props) {
  const subs = category.subcategories ?? [];

  if (subs.length > 0) {
    return (
      <div className={SITE_PAGE_SHELL_COMPACT}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/galeria"
            className="mb-8 inline-block text-sm tracking-widest text-stone hover:text-accent"
          >
            ← Portfolio
          </Link>
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:text-6xl">
              {category.label}
            </h1>
            {category.description ? (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/75 md:text-base lg:text-lg">
                {category.description}
              </p>
            ) : null}
          </motion.header>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:gap-10">
            {subs.map((sub, i) => {
              const cover = resolvePortfolioSubcategoryCover(sub);
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/portfolio/${category.slug}/${sub.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-charcoal/[0.03]">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-charcoal/[0.07] via-charcoal/[0.03] to-transparent"
                          aria-hidden
                        />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/15 via-transparent to-transparent opacity-50" />
                    </div>
                    <div className="border-b border-charcoal/12 pb-3 pt-2">
                      <h2 className="font-display text-xl font-light text-charcoal transition-colors group-hover:text-accent md:text-2xl lg:text-3xl">
                        {sub.label}
                      </h2>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <CategoryContent
      label={category.label}
      backHref="/galeria"
      imageUrls={category.galleryImages}
    />
  );
}
