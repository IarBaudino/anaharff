import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesProjectClient } from "@/components/series/SeriesProjectClient";
import { siteConfig } from "@/lib/seo";
import { buildAbsolutePageMetadata } from "@/lib/seo-metadata";
import { getServerSiteContent } from "@/lib/site-content-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getServerSiteContent();
  const project = content.series.projects.find((s) => s.slug === slug);
  if (!project) return {};
  const path = `/series/${slug}`;
  const description = project.description || project.statement || `Serie ${project.label}`;

  return buildAbsolutePageMetadata({
    absoluteTitle: `${project.label} · Series · ${siteConfig.name}`,
    description,
    path,
  });
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getServerSiteContent();
  const project = content.series.projects.find((s) => s.slug === slug);
  if (!project) notFound();
  return <SeriesProjectClient project={project} />;
}
