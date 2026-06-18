import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo-metadata";

const title = "Privacidad";
const description =
  "Política de privacidad y tratamiento de datos personales del sitio de Ana Harff (Argentina).";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/privacidad",
});

export default function PrivacidadLayout({ children }: { children: ReactNode }) {
  return children;
}
