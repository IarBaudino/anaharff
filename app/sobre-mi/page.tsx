"use client";

import { SobreMiPageShell } from "@/components/sobre-mi/SobreMiPageShell";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { SectionDivider } from "@/components/SectionDivider";

export default function SobreMiPage() {
  const { content } = useSiteContent();
  const sobreMi = content?.sobreMi ?? defaultSiteContent.sobreMi;

  return (
    <SobreMiPageShell
      kicker={sobreMi.kickerColumna}
      title={sobreMi.tituloPagina}
      sectionId="biografia"
    >
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
    </SobreMiPageShell>
  );
}
