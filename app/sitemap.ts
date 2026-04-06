import type { MetadataRoute } from "next";
import { getSiteOrigin, portfolioSlugs, seriesSlugs } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin();
  const lastModified = new Date();

  const staticPaths = [
    "",
    "/blog",
    "/sobre-mi",
    "/tienda",
    "/contacto",
    "/portfolio",
    "/sesion",
    "/series",
  ];

  const out: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path === "" ? "/" : path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.85,
  }));

  for (const slug of portfolioSlugs) {
    out.push({
      url: `${base}/portfolio/${slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  for (const slug of seriesSlugs) {
    out.push({
      url: `${base}/series/${slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  return out;
}
