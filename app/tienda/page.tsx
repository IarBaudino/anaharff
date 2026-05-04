"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { TiendaGrid } from "@/components/tienda/TiendaGrid";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";
import { useCartStore } from "@/stores/cart-store";

export default function TiendaPage() {
  const { content } = useSiteContent();
  const tienda = content?.tienda ?? defaultSiteContent.tienda;
  const cartCount = useCartStore((s) => s.items.reduce((sum, it) => sum + it.quantity, 0));

  return (
    <div className="pt-6 md:pt-24 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 pb-10 md:mb-8 md:pb-12"
        >
          <p className="section-kicker mb-3">Edición limitada</p>
          <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:text-6xl">
            {tienda.titulo}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-charcoal/80">
            {tienda.descripcion}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/tienda/carrito"
              className="inline-flex items-center rounded-full border border-charcoal/25 px-4 py-2 text-sm text-charcoal transition-colors hover:bg-charcoal/[0.06]"
            >
              Ver carrito ({cartCount})
            </Link>
          </div>
          <SectionDivider variant="ornament" className="mt-10" />
          <SectionDivider variant="double" className="mt-4 opacity-90" />
        </motion.header>

        <SectionDivider variant="wide" className="mb-12 md:mb-14" />

        <TiendaGrid items={tienda.items} />
      </div>
    </div>
  );
}
