"use client";

import { SobreMiCurriculoContent } from "@/components/sobre-mi/SobreMiCurriculoContent";
import { SobreMiPageShell } from "@/components/sobre-mi/SobreMiPageShell";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";

export default function CurriculoPage() {
  const { content } = useSiteContent();
  const sobreMi = content?.sobreMi ?? defaultSiteContent.sobreMi;

  return (
    <SobreMiPageShell
      kicker={sobreMi.kickerColumna}
      title={sobreMi.curriculo.titulo}
      sectionId="curriculo"
      layout="stacked"
    >
      <SobreMiCurriculoContent curriculo={sobreMi.curriculo} />
    </SobreMiPageShell>
  );
}
