import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo-metadata";

const title = "Blog";
const description =
  "Notas sobre fotografía analógica, proceso creativo y proyectos. Ana Harff, Buenos Aires.";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/blog",
});

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
