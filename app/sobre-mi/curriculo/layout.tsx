import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const title = "Currículo";
const description =
  "Trayectoria, exposiciones y proyectos de Ana Harff. Fotografía analógica en Buenos Aires.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/sobre-mi/curriculo") },
  openGraph: {
    title: `${title} · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/sobre-mi/curriculo"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteConfig.name}`,
    description,
  },
};

export default function CurriculoLayout({ children }: { children: ReactNode }) {
  return children;
}
