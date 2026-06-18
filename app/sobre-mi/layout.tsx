import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo-metadata";

const title = "La artista";
const description =
  "Biografía y trayectoria de Ana Harff. Fotografía analógica en Buenos Aires.";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/sobre-mi",
});

export default function SobreMiLayout({ children }: { children: ReactNode }) {
  return children;
}
