import type {
  PortfolioCategory,
  PortfolioSubcategory,
  SeriesProject,
  SeriesSubcategory,
} from "@/lib/site-content";

function uniqueTrimmedUrls(...groups: (string | undefined | null)[][]): string[] {
  const set = new Set<string>();
  for (const group of groups) {
    for (const raw of group) {
      const url = (raw ?? "").trim();
      if (url) set.add(url);
    }
  }
  return [...set];
}

/** Portada + galería de una categoría, serie o subcategoría (sin duplicados). */
export function imageUrlsFromGalleryEntity(entity: {
  coverImageUrl?: string;
  galleryImages?: string[];
}): string[] {
  return uniqueTrimmedUrls([entity.coverImageUrl], entity.galleryImages ?? []);
}

export function imageUrlsFromPortfolioSubcategory(sub: PortfolioSubcategory): string[] {
  return imageUrlsFromGalleryEntity(sub);
}

export function imageUrlsFromPortfolioCategory(cat: PortfolioCategory): string[] {
  const urls = new Set(imageUrlsFromGalleryEntity(cat));
  for (const sub of cat.subcategories ?? []) {
    for (const url of imageUrlsFromPortfolioSubcategory(sub)) {
      urls.add(url);
    }
  }
  return [...urls];
}

export function imageUrlsFromSeriesSubcategory(sub: SeriesSubcategory): string[] {
  return imageUrlsFromGalleryEntity(sub);
}

export function imageUrlsFromSeriesProject(project: SeriesProject): string[] {
  const urls = new Set(imageUrlsFromGalleryEntity(project));
  for (const sub of project.subcategories ?? []) {
    for (const url of imageUrlsFromSeriesSubcategory(sub)) {
      urls.add(url);
    }
  }
  return [...urls];
}
