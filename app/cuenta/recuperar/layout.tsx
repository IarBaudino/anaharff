import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Recuperar contraseña",
  description: "Restablecé el acceso a tu cuenta en Ana Harff.",
  path: "/cuenta/recuperar",
  robots: { index: false, follow: false },
});

export default function RecuperarLayout({ children }: { children: ReactNode }) {
  return children;
}
