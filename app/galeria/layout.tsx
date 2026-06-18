import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo-metadata";

const title = "Portfolio";
const description =
  "Retrato, desnudo, familiar, eventos y naturaleza. Galerías de fotografía analógica de Ana Harff, Buenos Aires.";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/galeria",
});

export default function GaleriaLayout({ children }: { children: ReactNode }) {
  return children;
}
