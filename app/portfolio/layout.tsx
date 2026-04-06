import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const title = "Portfolio";
const description =
  "Galerías de fotografía analógica: desnudos, retratos, artístico y experimental. Ana Harff, Buenos Aires.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/portfolio") },
  openGraph: {
    title: `${title} · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/portfolio"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteConfig.name}`,
    description,
  },
};

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return children;
}
