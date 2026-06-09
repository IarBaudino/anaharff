import type { SiteContent } from "@/lib/site-content";
import {
  imageUrlsFromPortfolioCategory,
  imageUrlsFromPortfolioSubcategory,
  imageUrlsFromSeriesProject,
  imageUrlsFromSeriesSubcategory,
} from "@/lib/collection-image-urls";

function uniqueTrimmed(urls: Iterable<string | undefined | null>): string[] {
  const set = new Set<string>();
  for (const raw of urls) {
    const url = (raw ?? "").trim();
    if (url) set.add(url);
  }
  return [...set];
}

/** Todas las URLs de imagen referenciadas en `site/content`. */
export function collectAllSiteImageUrls(content: SiteContent): string[] {
  const urls: string[] = [];

  const hero = content.home.heroImagenUrl?.trim();
  if (hero) urls.push(hero);

  for (const item of content.tienda.items ?? []) {
    const u = item.imagenUrl?.trim();
    if (u) urls.push(u);
  }

  for (const entrada of content.blog.entradas ?? []) {
    const u = entrada.imagenUrl?.trim();
    if (u) urls.push(u);
  }

  for (const cat of content.portfolio.categories ?? []) {
    urls.push(...imageUrlsFromPortfolioCategory(cat));
    for (const sub of cat.subcategories ?? []) {
      urls.push(...imageUrlsFromPortfolioSubcategory(sub));
    }
  }

  for (const project of content.series.projects ?? []) {
    urls.push(...imageUrlsFromSeriesProject(project));
    for (const sub of project.subcategories ?? []) {
      urls.push(...imageUrlsFromSeriesSubcategory(sub));
    }
  }

  return uniqueTrimmed(urls);
}

function replaceInStrings<T>(value: T, map: Record<string, string>): T {
  if (typeof value === "string") {
    const t = value.trim();
    return (map[t] ?? value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceInStrings(item, map)) as T;
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      next[key] = replaceInStrings(child, map);
    }
    return next as T;
  }
  return value;
}

/** Devuelve una copia de `content` con URLs reemplazadas según `map` (vieja → nueva). */
export function replaceSiteImageUrls(
  content: SiteContent,
  map: Record<string, string>
): SiteContent {
  return replaceInStrings(content, map);
}
