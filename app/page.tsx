"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HomeHeroTitle } from "@/components/home/HomeHeroTitle";
import { SectionDivider } from "@/components/SectionDivider";
import { cn } from "@/lib/utils";
import { siteButtonOutline, siteButtonSolid } from "@/lib/site-buttons";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent, type StoreItem } from "@/lib/site-content";

const PLACEHOLDER =
  "https://placehold.co/900x1200/f7f5f0/8c8c8c?text=Ana+Harff";

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

  const destacadoLinks = ["/tienda", "/portfolio", "/series"] as const;
  const destacadoEtiquetas = ["Edición limitada", "Portfolio", "Series"] as const;

  const destacados = featuredItems(tienda.items, tienda.destacadosCantidad ?? 3).map((item, i) => ({
    id: item.id,
    url: item.imagenUrl?.trim() || PLACEHOLDER,
    titulo: item.titulo,
    href: destacadoLinks[i] ?? "/tienda",
    etiqueta: destacadoEtiquetas[i] ?? "Ver más",
  }));
  const useEditorialLayout = destacados.length <= 3;

  return (
    <div className="pt-4 md:pt-12">
      {/* Título del sitio + Instagram / contacto (misma línea visual, encima de las dos líneas) */}
      <HomeHeroTitle titulo={home.titulo} />

      {/* Doble línea decorativa */}
      <div className="border-b border-charcoal/[0.06] bg-cream">
        <div className="mx-auto max-w-[1600px] px-4 pb-2 pt-1 sm:px-6 lg:px-10">
          <SectionDivider variant="double" className="opacity-90" />
        </div>
      </div>

      {/* Hero editorial: imagen + manifiesto (sin repetir el nombre como h1) */}
      <section className="relative border-b border-charcoal/[0.12]">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-12 lg:gap-14 lg:py-16 xl:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="relative lg:col-span-5 xl:col-span-6"
            >
              <p className="section-kicker mb-6 lg:mb-8">{home.heroKicker}</p>
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-charcoal/[0.04]">
                <Image
                  src={heroUrl}
                  alt={`Imagen principal — ${home.titulo}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain p-2"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/[0.12] via-transparent to-transparent opacity-60"
                  aria-hidden
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-center border-charcoal/10 lg:col-span-7 lg:border-l lg:pl-10 xl:col-span-6 xl:pl-14"
            >
              <SectionDivider variant="line" className="mb-8 lg:hidden" />
              <h2 className="sr-only">Manifiesto</h2>
              {home.introduccionIdiomas.map((bloque, i) => (
                <p
                  key={bloque.id}
                  className={cn(
                    "max-w-xl leading-[1.75] text-charcoal/90",
                    i === 0
                      ? "text-lg md:text-xl"
                      : "mt-6 text-base italic leading-relaxed text-stone md:text-lg"
                  )}
                >
                  {bloque.texto}
                </p>
              ))}
              <div className="rule-fade my-10 max-w-md" aria-hidden />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/portfolio" className={siteButtonOutline}>
                  Ver portfolio
                </Link>
                <Link href="/tienda" className={siteButtonSolid}>
                  Tienda
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Destacados — rejilla asimétrica */}
      <section className="border-b border-charcoal/[0.12] bg-cream">
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
          <SectionDivider variant="ornament" className="py-2" />
        </div>
        <div className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24 lg:pt-2">
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
              href="/tienda"
              className="text-sm text-stone underline decoration-charcoal/20 underline-offset-4 transition-colors hover:text-charcoal hover:decoration-charcoal/40"
            >
              {home.destacadosLinkTexto}
            </Link>
          </motion.div>

          <div
            className={
              useEditorialLayout
                ? "grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2 md:gap-5 lg:gap-6"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5 lg:gap-6"
            }
          >
            {destacados.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={
                  useEditorialLayout && i === 0
                    ? "md:col-span-7 md:row-span-2"
                    : useEditorialLayout && i === 1
                      ? "md:col-span-5 md:col-start-8 md:row-start-1"
                      : useEditorialLayout && i === 2
                        ? "md:col-span-5 md:col-start-8 md:row-start-2"
                        : ""
                }
              >
                <Link
                  href={d.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-charcoal/15 bg-cream shadow-sm transition-all duration-500 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-2xl before:bg-accent/0 before:transition-colors hover:border-charcoal/25 hover:shadow-md hover:before:bg-accent/90"
                >
                  <div
                    className={
                      useEditorialLayout && i === 0
                        ? "relative min-h-[320px] flex-1 md:min-h-0"
                        : "relative aspect-[4/5] md:aspect-[16/11]"
                    }
                  >
                    <Image
                      src={d.url}
                      alt={d.titulo}
                      fill
                      sizes={
                        i === 0
                          ? "(max-width: 768px) 100vw, 58vw"
                          : "(max-width: 768px) 100vw, 42vw"
                      }
                      className="object-contain p-2 transition-opacity duration-300 group-hover:opacity-95"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/[0.04]" />
                  </div>
                  <div className="border-t border-charcoal/5 px-5 py-4 md:px-6 md:py-5">
                    <p className="font-display text-lg font-light text-charcoal md:text-xl">
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
        <div className="mx-auto mb-12 max-w-3xl md:mb-16">
          <SectionDivider variant="wide" />
        </div>
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
  );
}
