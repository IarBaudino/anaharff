import type { ReactNode } from "react";
import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const title = "Galería";
const description = "Álbumes fotográficos y series de Ana Harff en una sola navegación.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/galeria") },
  openGraph: {
    title: `${title} · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/galeria"),
    siteName: siteConfig.name,
    locale: "es_AR",
    type: "website",
  },
};

export default function GaleriaLayout({ children }: { children: ReactNode }) {
  return children;
}
