import { absoluteUrl, getSiteOrigin, siteConfig } from "@/lib/seo";
import { SITE_INSTAGRAM_URL } from "@/lib/site-links";

const mainSections = [
  { name: "Portfolio", path: "/galeria" },
  { name: "Series", path: "/series" },
  { name: "La artista", path: "/sobre-mi" },
  { name: "Blog", path: "/blog" },
  { name: "Tienda", path: "/tienda" },
  { name: "Contacto", path: "/contacto" },
] as const;

export function SiteJsonLd() {
  const origin = getSiteOrigin();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: siteConfig.name,
        url: origin,
        description: siteConfig.defaultDescription,
        inLanguage: "es-AR",
        publisher: { "@id": `${origin}/#person` },
      },
      {
        "@type": ["Person", "Photographer"],
        "@id": `${origin}/#person`,
        name: siteConfig.name,
        url: origin,
        jobTitle: "Fotógrafa",
        description: siteConfig.defaultDescription,
        image: absoluteUrl("/opengraph-image"),
        knowsAbout: [
          "Fotografía analógica",
          "Retrato",
          "Desnudo artístico",
          "Eventos",
          "Naturaleza",
          "Buenos Aires",
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Buenos Aires",
          addressCountry: "AR",
        },
        sameAs: [SITE_INSTAGRAM_URL],
        mainEntityOfPage: { "@id": `${origin}/#website` },
      },
      {
        "@type": "ItemList",
        "@id": `${origin}/#sitenavigation`,
        name: "Secciones principales",
        itemListElement: mainSections.map((section, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: section.name,
          url: absoluteUrl(section.path),
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
