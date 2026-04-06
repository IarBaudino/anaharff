"use client";

import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export default function SobreMiPage() {
  const { content } = useSiteContent();
  const sobreMi = content?.sobreMi ?? defaultSiteContent.sobreMi;

  return (
    <div className="pb-24 pt-6 md:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 lg:pt-2"
          >
            <p className="section-kicker mb-4">{sobreMi.kickerColumna}</p>
            <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl lg:sticky lg:top-28">
              {sobreMi.tituloPagina}
            </h1>
            <SectionDivider variant="line" className="mt-8 hidden lg:block" />
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            id="biografia"
            className="border-charcoal/10 lg:col-span-8 lg:border-l-2 lg:border-charcoal/15 lg:pl-10 xl:pl-12"
          >
            <SectionDivider variant="double" className="mb-10 lg:hidden" />
            {sobreMi.idiomas.map((bloque, idx) => (
              <div
                key={bloque.id}
                className={cn(idx > 0 && "mt-16 border-t-2 border-charcoal/10 pt-16")}
              >
                <div className="max-w-2xl space-y-8 text-lg leading-[1.85] text-charcoal/90">
                  {bloque.bio1.trim() ? <p>{bloque.bio1}</p> : null}
                  {bloque.bio2.trim() ? <p>{bloque.bio2}</p> : null}
                </div>

                <div className="mt-16 border-t-2 border-charcoal/10 pt-12">
                  <SectionDivider variant="line" className="mb-10 max-w-md" />
                  {bloque.tituloSesion.trim() ? (
                    <h2 className="font-display text-2xl font-light text-charcoal">
                      {bloque.tituloSesion}
                    </h2>
                  ) : null}
                  {bloque.sesionTexto.trim() ? (
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-charcoal/85">
                      {bloque.sesionTexto}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
