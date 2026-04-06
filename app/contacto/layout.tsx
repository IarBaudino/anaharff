import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const title = "Contacto";
const description =
  "Escribime para sesiones, consultas sobre obras o colaboraciones. Formulario de contacto — Ana Harff.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/contacto") },
  openGraph: {
    title: `${title} · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/contacto"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteConfig.name}`,
    description,
  },
};

export default function ContactoLayout({ children }: { children: ReactNode }) {
  return children;
}
