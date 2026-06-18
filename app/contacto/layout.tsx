import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo-metadata";

const title = "Contacto";
const description =
  "Consultas sobre obras, impresiones o colaboraciones. Formulario de contacto — Ana Harff, Buenos Aires.";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/contacto",
});

export default function ContactoLayout({ children }: { children: ReactNode }) {
  return children;
}
