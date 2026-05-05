"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HomeHeroTitle } from "@/components/home/HomeHeroTitle";
import { HomeTestimoniosSection } from "@/components/home/HomeTestimoniosSection";
import { SectionDivider } from "@/components/SectionDivider";
import { cn } from "@/lib/utils";
import { siteButtonOutline, siteButtonSolid } from "@/lib/site-buttons";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent, type StoreItem } from "@/lib/site-content";

const PLACEHOLDER =
  "https://placehold.co/900x1200/f7f5f0/8c8c8c/png?text=Ana+Harff";

function featuredItems(items: StoreItem[], limit: number): StoreItem[] {
  const chosen = items
    .filter((it) => it.destacarEnInicio)
    .sort((a, b) => (a.destacadoOrden ?? Number.MAX_SAFE_INTEGER) - (b.destacadoOrden ?? Number.MAX_SAFE_INTEGER));

  const merged = [...chosen];
  if (merged.length >= limit) return merged.slice(0, limit);

  for (const it of items) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.id === it.id)) merged.push(it);
  }

  for (const d of defaultSiteContent.tienda.items) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.id === d.id)) merged.push(d);
  }
  return merged.slice(0, limit);
}

function heroSrc(
  heroUrl: string | undefined,
  firstStoreUrl: string | undefined
): string {
  const u = (heroUrl ?? "").trim();
  if (u) return u;
  const f = (firstStoreUrl ?? "").trim();
  if (f) return f;
  return PLACEHOLDER;
}

export default function HomePage() {
  const { content } = useSiteContent();
  const home = content?.home ?? defaultSiteContent.home;
  const tienda = content?.tienda ?? defaultSiteContent.tienda;
  const heroUrl = heroSrc(home.heroImagenUrl, tienda.items[0]?.imagenUrl);

  const destacadoLinks = ["/galeria", "/galeria", "/series"] as const;
  const destacadoEtiquetas = ["Galería", "Galería", "Series"] as const;

  const destacados = featuredItems(tienda.items, tienda.destacadosCantidad ?? 3).map((item, i) => ({
    id: item.id,
    url: item.imagenUrl?.trim() || PLACEHOLDER,
    titulo: item.titulo,
    href: destacadoLinks[i] ?? "/tienda",
    etiqueta: destacadoEtiquetas[i] ?? "Ver más",
  }));
  return (
    <div>
      {/* Primer pantallazo: solo imagen de impacto (sin scroll dentro del bloque) */}
      <section
        aria-label="Imagen principal"
        className="relative w-full bg-[var(--color-cream)] min-h-[calc(100dvh-3.5rem)] lg:min-h-dvh"
      >
        <Image
          src={heroUrl}
          alt={`Imagen principal — ${home.titulo}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{ objectPosition: `${home.heroFocoX}% ${home.heroFocoY}%` }}
        />
        <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-charcoal/55 lg:bottom-8">
          <span className="block h-6 w-px bg-gradient-to-b from-charcoal/35 to-transparent" aria-hidden />
        </div>
      </section>

      <HomeTestimoniosSection
        kicker={home.testimoniosKicker}
        titulo={home.testimoniosTitulo}
        items={home.testimonios}
      />

      <div className="bg-cream pt-6 md:pt-12">
        {/* Título del sitio + Instagram / contacto */}
        <HomeHeroTitle titulo={home.titulo} />

        {/* Doble línea decorativa */}
        <div className="bg-cream">
          <div className="mx-auto max-w-[1600px] px-4 pb-2 pt-1 sm:px-6 lg:px-10">
            <SectionDivider variant="double" className="opacity-90" />
          </div>
        </div>

        {/* Manifiesto (la imagen de impacto ya se vio arriba) */}
        <section className="relative border-b border-charcoal/[0.12]">
          <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-3xl"
            >
              <p className="section-kicker mb-8">{home.heroKicker}</p>
              <h2 className="sr-only">Manifiesto</h2>
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
                  Ver galería
                </Link>
                <Link href="/tienda" className={siteButtonSolid}>
                  Tienda
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      {/* Destacados — rejilla asimétrica */}
      <section className="border-b border-charcoal/[0.12] bg-cream">
        <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pb-24 lg:pt-8">
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

          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {destacados.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={d.href}
                  className="group block"
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-charcoal/[0.05]">
                    <Image
                      src={d.url}
                      alt={d.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
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

      {/* Cierre */}
      <section className="px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
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
      </section>
      </div>
    </div>
  );
}
