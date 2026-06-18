import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo-metadata";

const title = "Series";
const description =
  "Proyectos y series fotográficas de Ana Harff: narrativas en fotografía analógica, Buenos Aires.";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/series",
});

export default function SeriesLayout({ children }: { children: ReactNode }) {
  return children;
}
