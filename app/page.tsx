"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HomeHeroGallery } from "@/components/home/HomeHeroGallery";
import { HomeTestimoniosSection } from "@/components/home/HomeTestimoniosSection";
import { cn } from "@/lib/utils";
import { siteButtonOutline, siteButtonSolid } from "@/lib/site-buttons";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  defaultSiteContent,
  resolveHomeHeroImages,
  sanitizePublicImageUrl,
} from "@/lib/site-content";

export default function HomePage() {
  const { content } = useSiteContent();
  const home = content?.home ?? defaultSiteContent.home;
  const heroImages = resolveHomeHeroImages(home);

  const limit = home.destacadosCantidad ?? 3;
  const destacados = home.destacados.slice(0, limit).map((item) => ({
    id: item.id,
    url: sanitizePublicImageUrl(item.imagenUrl),
    titulo: item.titulo,
    href: item.href?.trim() || "/galeria",
    etiqueta: item.etiqueta,
  }));

  return (
    <div>
      <HomeHeroGallery images={heroImages} />

      <HomeTestimoniosSection
        kicker={home.testimoniosKicker}
        titulo={home.testimoniosTitulo}
        items={home.testimonios}
      />

      <div className="bg-cream">
        <section className="relative border-b border-charcoal/[0.12]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              {home.heroKicker.trim() ? (
                <p className="section-kicker mb-8 text-base md:text-lg">{home.heroKicker}</p>
              ) : null}
              <h1 className="sr-only">{home.titulo}</h1>
              {home.introduccionIdiomas.map((bloque, i) => (
                <p
                  key={bloque.id}
                  className={cn(
                    "leading-[1.75] text-charcoal/90",
                    i === 0
                      ? "text-lg md:text-xl"
                      : "mt-6 text-base italic leading-relaxed text-stone md:text-lg"
                  )}
                >
                  {bloque.texto}
                </p>
              ))}
              <div className="rule-fade my-10" aria-hidden />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/galeria" className={siteButtonOutline}>
                  Ver portfolio
                </Link>
                <Link href="/tienda" className={siteButtonSolid}>
                  Tienda
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {destacados.length > 0 ? (
          <section className="border-b border-charcoal/[0.12] bg-cream">
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5 }}
                className="mb-10 flex flex-col gap-2 sm:mb-14 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p className="section-kicker mb-2">{home.destacadosKicker}</p>
                  <h2 className="font-display text-3xl font-light tracking-tight text-charcoal md:text-4xl">
                    {home.destacadosTitulo}
                  </h2>
                </div>
                <Link
                  href="/galeria"
                  className="text-sm text-stone underline decoration-charcoal/20 underline-offset-4 transition-colors hover:text-charcoal hover:decoration-charcoal/40"
                >
                  {home.destacadosLinkTexto}
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {destacados.map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={d.href} className="group block">
                      <div className="relative aspect-[16/11] overflow-hidden bg-charcoal/[0.05]">
                        {d.url ? (
                          <Image
                            src={d.url}
                            alt={d.titulo}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-charcoal/[0.07] via-charcoal/[0.03] to-transparent"
                            aria-hidden
                          />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/20 via-charcoal/0 to-charcoal/5" />
                      </div>
                      <div className="border-b border-charcoal/12 pb-4 pt-3">
                        <p className="font-display text-lg font-light tracking-tight text-charcoal transition-colors group-hover:text-accent md:text-xl">
                          {d.titulo}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone">
                          {d.etiqueta}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl text-left"
          >
            <p className="section-kicker mb-4">{home.cierreKicker}</p>
            <p className="font-display text-2xl font-light leading-snug text-charcoal md:text-3xl">
              {home.cierreTexto}
            </p>
            <Link
              href="/contacto"
              className={cn("mt-10", siteButtonOutline, "border-charcoal/45 px-8")}
            >
              Escribir
            </Link>
          </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
