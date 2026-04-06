import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const title = "Sesión de fotos";
const description =
  "Sesiones de fotografía analógica en Buenos Aires. Información sobre encargos y proceso con Ana Harff.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/sesion") },
  openGraph: {
    title: `${title} · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/sesion"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteConfig.name}`,
    description,
  },
};

export default function SesionLayout({ children }: { children: ReactNode }) {
  return children;
}
