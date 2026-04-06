import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/cuenta",
          "/tienda/exito",
          "/tienda/error",
          "/tienda/pendiente",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ""),
  };
}
