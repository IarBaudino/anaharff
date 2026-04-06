import { absoluteUrl, getSiteOrigin, siteConfig } from "@/lib/seo";
import { SITE_INSTAGRAM_URL } from "@/lib/site-links";

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
        "@type": "Person",
        "@id": `${origin}/#person`,
        name: siteConfig.name,
        url: origin,
        jobTitle: "Fotógrafa",
        description: siteConfig.defaultDescription,
        image: absoluteUrl("/opengraph-image"),
        knowsAbout: ["Fotografía analógica", "Retrato", "Desnudo artístico", "Buenos Aires"],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Buenos Aires",
          addressCountry: "AR",
        },
        sameAs: [SITE_INSTAGRAM_URL],
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
