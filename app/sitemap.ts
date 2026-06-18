import type { MetadataRoute } from "next";
import { getServerSiteContent } from "@/lib/site-content-server";
import { getSiteOrigin } from "@/lib/seo";

const base = getSiteOrigin();

const staticRoutes: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/galeria", changeFrequency: "weekly", priority: 0.9 },
  { path: "/series", changeFrequency: "weekly", priority: 0.9 },
  { path: "/sobre-mi", changeFrequency: "monthly", priority: 0.8 },
  { path: "/sobre-mi/curriculo", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contacto", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacidad", changeFrequency: "yearly", priority: 0.4 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/tienda", changeFrequency: "weekly", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const content = await getServerSiteContent();

  const out: MetadataRoute.Sitemap = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  for (const cat of content.portfolio.categories) {
    out.push({
      url: `${base}/portfolio/${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
    for (const sub of cat.subcategories ?? []) {
      out.push({
        url: `${base}/portfolio/${cat.slug}/${sub.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  for (const project of content.series.projects) {
    out.push({
      url: `${base}/series/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    });
    for (const sub of project.subcategories ?? []) {
      out.push({
        url: `${base}/series/${project.slug}/${sub.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return out;
}
