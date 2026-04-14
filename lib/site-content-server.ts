import { getAdminDb } from "@/lib/firebase-admin";
import {
  defaultSiteContent,
  normalizeBlog,
  normalizeFeaturedOrder,
  normalizeHome,
  normalizePortfolioCategories,
  normalizeSeriesProjects,
  normalizeSobreMi,
  normalizeStoreItems,
  type SiteContent,
} from "@/lib/site-content";

const CONTENT_DOC = "site/content";

/** Lee contenido de sitio en servidor (Firestore Admin) con fallback seguro. */
export async function getServerSiteContent(): Promise<SiteContent> {
  const db = getAdminDb();
  if (!db) return defaultSiteContent;

  try {
    const snap = await db.doc(CONTENT_DOC).get();
    if (!snap.exists) return defaultSiteContent;

    const partial = snap.data() as Partial<SiteContent>;
    const normalizedItems = normalizeFeaturedOrder(normalizeStoreItems(partial.tienda?.items));
    const cantidadRaw = partial.tienda?.destacadosCantidad;
    const destacadosCantidad = cantidadRaw === 4 || cantidadRaw === 6 ? cantidadRaw : 3;

    return {
      home: normalizeHome(partial.home),
      sobreMi: normalizeSobreMi(partial.sobreMi),
      blog: normalizeBlog(partial.blog),
      portfolio: {
        categories: normalizePortfolioCategories(partial.portfolio?.categories),
      },
      series: {
        projects: normalizeSeriesProjects(partial.series?.projects),
      },
      tienda: {
        ...defaultSiteContent.tienda,
        ...partial.tienda,
        destacadosCantidad,
        items: normalizedItems.length ? normalizedItems : defaultSiteContent.tienda.items,
      },
    };
  } catch {
    return defaultSiteContent;
  }
}
