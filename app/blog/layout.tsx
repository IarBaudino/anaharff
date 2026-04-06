import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const title = "Blog";
const description =
  "Notas sobre fotografía analógica, proceso creativo y proyectos. Ana Harff, Buenos Aires.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    title: `${title} · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/blog"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteConfig.name}`,
    description,
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
