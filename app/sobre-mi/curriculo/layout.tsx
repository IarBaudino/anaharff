import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo-metadata";

const title = "Currículo";
const description =
  "Trayectoria, exposiciones y proyectos de Ana Harff. Fotografía analógica en Buenos Aires.";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/sobre-mi/curriculo",
});

export default function CurriculoLayout({ children }: { children: ReactNode }) {
  return children;
}
