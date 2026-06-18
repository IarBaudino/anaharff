import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesContent } from "@/components/series/SeriesContent";
import { siteConfig } from "@/lib/seo";
import { buildAbsolutePageMetadata } from "@/lib/seo-metadata";
import { getServerSiteContent } from "@/lib/site-content-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subslug: string }>;
}): Promise<Metadata> {
  const { slug, subslug } = await params;
  const content = await getServerSiteContent();
  const project = content.series.projects.find((s) => s.slug === slug);
  const sub = project?.subcategories?.find((x) => x.slug === subslug);
  if (!project || !sub) return {};
  const path = `/series/${slug}/${subslug}`;
  const description = sub.description || sub.statement || `${sub.label} · ${siteConfig.name}`;

  return buildAbsolutePageMetadata({
    absoluteTitle: `${sub.label} · ${project.label} · ${siteConfig.name}`,
    description,
    path,
  });
}

export default async function SeriesSubPage({
  params,
}: {
  params: Promise<{ slug: string; subslug: string }>;
}) {
  const { slug, subslug } = await params;
  const content = await getServerSiteContent();
  const project = content.series.projects.find((s) => s.slug === slug);
  const sub = project?.subcategories?.find((x) => x.slug === subslug);
  if (!project || !sub) notFound();

  return (
    <SeriesContent
      label={sub.label}
      statement={sub.statement}
      backHref={`/series/${slug}`}
      imageUrls={sub.galleryImages}
    />
  );
}
