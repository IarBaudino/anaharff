import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const title = "Series";
const description =
  "Proyectos y series fotográficas de Ana Harff: narrativas en fotografía analógica.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/series") },
  openGraph: {
    title: `${title} · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/series"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteConfig.name}`,
    description,
  },
};

export default function SeriesLayout({ children }: { children: ReactNode }) {
  return children;
}
