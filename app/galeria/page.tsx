"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  defaultSiteContent,
  resolveCategoryCover,
  resolveSeriesCover,
} from "@/lib/site-content";

type GalleryAlbum = {
  id: string;
  label: string;
  href: string;
  note: string;
  coverUrl: string;
};

const galleryCategoryOrder = ["desnudos", "retratos", "artistico", "familia", "naturaleza", "experimental"];

function AlbumCover({ label, coverUrl }: { label: string; coverUrl: string }) {
  if (!coverUrl) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-charcoal/[0.07] via-charcoal/[0.03] to-transparent"
        aria-hidden
      />
    );
  }
  return (
    <Image
      src={coverUrl}
      alt={`Portada de ${label}`}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
    />
  );
}

export default function GaleriaPage() {
  const { content } = useSiteContent();
  const categories = content?.portfolio.categories?.length
    ? content.portfolio.categories
    : defaultSiteContent.portfolio.categories;
  const series = content?.series.projects?.length
    ? content.series.projects
    : defaultSiteContent.series.projects;

  const orderedCategories = [...categories].sort((a, b) => {
    const ai = galleryCategoryOrder.indexOf(a.slug);
    const bi = galleryCategoryOrder.indexOf(b.slug);
    const va = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const vb = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    return va - vb;
  });

  const firstSeriesCover = series.map(resolveSeriesCover).find(Boolean) ?? "";

  const albums: GalleryAlbum[] = [
    {
      id: "galeria-series",
      label: "Series",
      href: "/series",
      note: "Subgalería de proyectos",
      coverUrl: firstSeriesCover,
    },
    ...orderedCategories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      href: `/portfolio/${cat.slug}`,
      note: "Ver galería",
      coverUrl: resolveCategoryCover(cat),
    })),
  ];

  return (
    <div className="pb-24 pt-6 md:pt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 pb-8 md:mb-12 md:pb-10">
          <p className="section-kicker mb-3">Colecciones</p>
          <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:text-6xl">
            Galería
          </h1>
          <SectionDivider variant="line" className="mt-10" />
          <SectionDivider variant="double" className="mt-3 opacity-80" />
        </motion.header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.45 }}
            >
              <Link href={album.href} className="group block">
                <div className="relative aspect-[16/11] overflow-hidden bg-charcoal/[0.05]">
                  <AlbumCover label={album.label} coverUrl={album.coverUrl} />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-55 transition-opacity duration-300 group-hover:opacity-65" />
                </div>
                <div className="border-b border-charcoal/12 pb-4 pt-3">
                  <h2 className="font-display text-2xl font-light tracking-tight text-charcoal transition-colors group-hover:text-accent">
                    {album.label}
                  </h2>
                  <span className="mt-1 inline-block text-xs uppercase tracking-[0.18em] text-stone transition-colors group-hover:text-charcoal">
                    {album.note}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
