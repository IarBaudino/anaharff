import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const DEFAULT_OG = "/opengraph-image";

type BaseMeta = {
  description: string;
  path: string;
  ogImage?: string;
  robots?: Metadata["robots"];
};

/** Título relativo (usa la plantilla del layout raíz: `%s · Ana Harff`). */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG,
  robots,
}: BaseMeta & { title: string }): Metadata {
  return buildMetadataCore(`${title} · ${siteConfig.name}`, description, path, ogImage, robots, title);
}

/** Título absoluto (páginas dinámicas con jerarquía larga). */
export function buildAbsolutePageMetadata({
  absoluteTitle,
  description,
  path,
  ogImage = DEFAULT_OG,
  robots,
}: BaseMeta & { absoluteTitle: string }): Metadata {
  return buildMetadataCore(absoluteTitle, description, path, ogImage, robots, absoluteTitle, true);
}

function buildMetadataCore(
  ogTitle: string,
  description: string,
  path: string,
  ogImage: string,
  robots: Metadata["robots"] | undefined,
  title: string,
  absolute = false
): Metadata {
  const canonical = absoluteUrl(path);
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);
  const image = { url: ogImageUrl, width: 1200, height: 630, alt: ogTitle };

  return {
    title: absolute ? { absolute: title } : title,
    description,
    robots,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImageUrl],
    },
  };
}
