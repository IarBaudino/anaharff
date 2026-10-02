import { SectionDivider } from "@/components/SectionDivider";
import { SITE_PAGE_SHELL } from "@/lib/layout-constants";
import { getServerSiteContent } from "@/lib/site-content-server";

export const dynamic = "force-dynamic";

export default async function TerminosPage() {
  const content = await getServerSiteContent();
  const titulo = content.legal.terminosTitulo.trim() || "Términos y condiciones";
  const cuerpo = content.legal.terminosCuerpo.trim();

  return (
    <div className={SITE_PAGE_SHELL}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="section-kicker mb-3">Legal</p>
          <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl">
            {titulo}
          </h1>
          <SectionDivider variant="line" className="mt-8 max-w-sm" />
        </header>
        {cuerpo ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-charcoal/90">
            {cuerpo}
          </div>
        ) : (
          <p className="text-stone">Los términos se publicarán pronto.</p>
        )}
      </div>
    </div>
  );
}
