import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";
import { getServerSiteContent } from "@/lib/site-content-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteOrigin();
  const lastModified = new Date();
  const content = await getServerSiteContent();

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

  for (const cat of content.portfolio.categories) {
    out.push({
      url: `${base}/portfolio/${cat.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  for (const series of content.series.projects) {
    out.push({
      url: `${base}/series/${series.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  return out;
}
