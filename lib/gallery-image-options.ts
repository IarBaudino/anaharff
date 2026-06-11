import { sanitizePublicImageUrl, type SiteContent } from "@/lib/site-content";

export type GalleryImageOption = {
  url: string;
  /** Ej. «Retratos» o «Series · Única · Capítulo 1». */
  sourceLabel: string;
  defaultHref: string;
  defaultTitulo: string;
};

function pushOption(
  out: GalleryImageOption[],
  seen: Set<string>,
  url: unknown,
  sourceLabel: string,
  defaultHref: string,
  defaultTitulo: string
) {
  const u = sanitizePublicImageUrl(typeof url === "string" ? url : "");
  if (!u || seen.has(u)) return;
  seen.add(u);
  out.push({ url: u, sourceLabel, defaultHref, defaultTitulo });
}

/** Todas las imágenes subidas en portfolio y series, para elegir en el inicio. */
export function collectGalleryImageOptions(content: SiteContent): GalleryImageOption[] {
  const seen = new Set<string>();
  const out: GalleryImageOption[] = [];

  for (const cat of content.portfolio.categories ?? []) {
    const catHref = `/portfolio/${cat.slug}`;
    const catLabel = cat.label.trim() || cat.slug;
    pushOption(out, seen, cat.coverImageUrl, catLabel, catHref, catLabel);
    for (const img of cat.galleryImages ?? []) {
      pushOption(out, seen, img, catLabel, catHref, catLabel);
    }
    for (const sub of cat.subcategories ?? []) {
      const subHref = `/portfolio/${cat.slug}/${sub.slug}`;
      const subLabel = sub.label.trim() || sub.slug;
      const source = `${catLabel} · ${subLabel}`;
      pushOption(out, seen, sub.coverImageUrl, source, subHref, subLabel);
      for (const img of sub.galleryImages ?? []) {
        pushOption(out, seen, img, source, subHref, subLabel);
      }
    }
  }

  for (const project of content.series.projects ?? []) {
    const href = `/series/${project.slug}`;
    const projectLabel = project.label.trim() || project.slug;
    const seriesSource = `Series · ${projectLabel}`;
    pushOption(out, seen, project.coverImageUrl, seriesSource, href, projectLabel);
    for (const img of project.galleryImages ?? []) {
      pushOption(out, seen, img, seriesSource, href, projectLabel);
    }
    for (const sub of project.subcategories ?? []) {
      const subHref = `/series/${project.slug}/${sub.slug}`;
      const subLabel = sub.label.trim() || sub.slug;
      const source = `Series · ${projectLabel} · ${subLabel}`;
      pushOption(out, seen, sub.coverImageUrl, source, subHref, subLabel);
      for (const img of sub.galleryImages ?? []) {
        pushOption(out, seen, img, source, subHref, subLabel);
      }
    }
  }

  return out;
}
