import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const title = "Acerca de mí";
const description =
  "Biografía, enfoque y sesiones de Ana Harff. Fotografía analógica en Buenos Aires.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/sobre-mi") },
  openGraph: {
    title: `${title} · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/sobre-mi"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteConfig.name}`,
    description,
  },
};

export default function SobreMiLayout({ children }: { children: ReactNode }) {
  return children;
}
