import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { PageBody } from "@/components/PageBody";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { getSiteOrigin, siteConfig } from "@/lib/seo";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-body",
});

const origin = getSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  keywords: [
    "fotografía analógica",
    "Buenos Aires",
    "retrato",
    "fotógrafa",
    "portfolio fotográfico",
    "desnudo artístico",
    "Ana Harff",
  ],
  authors: [{ name: siteConfig.name, url: origin }],
  creator: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Ana Harff — Fotografía analógica · Buenos Aires",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${lato.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <SiteJsonLd />
        <AuthProvider>
          <Header />
          <PageBody>{children}</PageBody>
        </AuthProvider>
      </body>
    </html>
  );
}
