"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { TiendaGrid } from "@/components/tienda/TiendaGrid";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import { SITE_PAGE_SHELL } from "@/lib/layout-constants";

export default function TiendaPage() {
  const { content } = useSiteContent();
  const tienda = content?.tienda ?? defaultSiteContent.tienda;
  const visibleItems = tienda.items.filter((it) => it.imagenUrl?.trim());
  const cartCount = useCartStore((s) => s.items.reduce((sum, it) => sum + it.quantity, 0));

  return (
    <div className={SITE_PAGE_SHELL}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pb-6 md:mb-10 md:pb-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="section-kicker mb-3">Edición limitada</p>
              <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:text-6xl">
                {tienda.titulo}
              </h1>
              {tienda.descripcion.trim() ? (
                <p className="mt-4 max-w-xl text-base leading-relaxed text-charcoal/75 md:text-[1.05rem]">
                  {tienda.descripcion}
                </p>
              ) : null}
            </div>
            <Link
              href="/tienda/carrito"
              className={cn(
                "shrink-0 self-start text-sm text-charcoal/80 transition-colors hover:text-accent sm:self-end",
                "border-b border-charcoal/20 pb-0.5 sm:text-xs sm:uppercase sm:tracking-[0.18em]"
              )}
            >
              Carrito ({cartCount})
            </Link>
          </div>
          <SectionDivider
            variant="line"
            className="mt-6 md:mt-8 [&>div:last-child]:!w-12 [&>div:last-child]:max-w-[3rem]"
          />
        </motion.header>

        {visibleItems.length === 0 ? (
          <p className="text-center text-sm text-stone">Próximamente.</p>
        ) : (
          <TiendaGrid items={visibleItems} />
        )}
      </div>
    </div>
  );
}
