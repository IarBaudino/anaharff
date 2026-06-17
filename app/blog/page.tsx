"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent, type BlogEntrada } from "@/lib/site-content";
import { SITE_PAGE_SHELL } from "@/lib/layout-constants";

export default function BlogPage() {
  const { content } = useSiteContent();
  const blog = content?.blog ?? defaultSiteContent.blog;

  return (
    <div className={SITE_PAGE_SHELL}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-charcoal/10 pb-8 md:pb-10"
        >
          <p className="section-kicker mb-4">{blog.kicker}</p>
          <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:text-6xl">
            {blog.tituloPagina}
          </h1>
          <SectionDivider variant="line" className="mt-8" />
        </motion.header>

        <div className="max-w-3xl pt-8 md:pt-10">
          {blog.introduccion.trim() ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-14 whitespace-pre-wrap text-lg leading-relaxed text-charcoal/80"
            >
              {blog.introduccion}
            </motion.p>
          ) : null}

          <div className="space-y-16">
            {blog.entradas
              .filter(
                (e) =>
                  e.titulo.trim() || e.cuerpo.trim() || e.imagenUrl.trim() || e.fecha.trim()
              )
              .map((entrada: BlogEntrada, i: number) => (
                <motion.article
                  key={entrada.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="border-t border-charcoal/10 pt-12 first:border-t-0 first:pt-0"
                >
                  {entrada.imagenUrl.trim() ? (
                    <div className="relative mb-8 aspect-[16/10] w-full overflow-hidden bg-charcoal/[0.06]">
                      <Image
                        src={entrada.imagenUrl.trim()}
                        alt={entrada.titulo.trim() || "Entrada del blog"}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 42rem"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    {entrada.titulo.trim() ? (
                      <h2 className="font-display text-2xl font-light tracking-tight text-charcoal md:text-3xl">
                        {entrada.titulo}
                      </h2>
                    ) : null}
                    {entrada.fecha.trim() ? (
                      <time
                        className="text-sm tabular-nums text-stone"
                        dateTime={entrada.fecha.trim()}
                      >
                        {entrada.fecha.trim()}
                      </time>
                    ) : null}
                  </div>
                  {entrada.cuerpo.trim() ? (
                    <p className="mt-5 whitespace-pre-wrap text-lg leading-relaxed text-charcoal/85">
                      {entrada.cuerpo}
                    </p>
                  ) : null}
                </motion.article>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
