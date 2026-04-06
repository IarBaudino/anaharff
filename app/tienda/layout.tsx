import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const title = "Tienda";
const description =
  "Edición limitada y obras disponibles para adquirir. Fotografía analógica de Ana Harff.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/tienda") },
  openGraph: {
    title: `${title} · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/tienda"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteConfig.name}`,
    description,
  },
};

export default function TiendaLayout({ children }: { children: ReactNode }) {
  return children;
}
