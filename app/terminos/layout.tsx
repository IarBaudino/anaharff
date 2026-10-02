import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso y compra en el sitio de Ana Harff.",
  path: "/terminos",
});

export default function TerminosLayout({ children }: { children: ReactNode }) {
  return children;
}
