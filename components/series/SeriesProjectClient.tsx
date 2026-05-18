"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SeriesContent } from "@/components/series/SeriesContent";
import { resolveSeriesSubcategoryCover, type SeriesProject } from "@/lib/site-content";

type Props = {
  project: SeriesProject;
};

export function SeriesProjectClient({ project }: Props) {
  const subs = project.subcategories ?? [];

  if (subs.length > 0) {
    return (
      <div className="pb-20 pt-6 md:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/series"
            className="mb-8 inline-block text-sm tracking-widest text-stone hover:text-accent"
          >
            ← Series
          </Link>
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl">
              {project.label}
            </h1>
            {project.statement ? (
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-charcoal/80 md:text-lg">
                {project.statement}
              </p>
            ) : null}
          </motion.header>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subs.map((sub, i) => {
              const cover = resolveSeriesSubcategoryCover(sub);
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/series/${project.slug}/${sub.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-transparent sm:aspect-[16/11]">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-charcoal/[0.07] via-charcoal/[0.03] to-transparent"
                          aria-hidden
                        />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-55" />
                    </div>
                    <div className="mt-3 border-b border-charcoal/12 pb-3">
                      <h2 className="font-display text-lg font-light text-charcoal transition-colors group-hover:text-accent md:text-xl">
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
    <SeriesContent
      label={project.label}
      statement={project.statement}
      backHref="/series"
      imageUrls={project.galleryImages}
    />
  );
}
