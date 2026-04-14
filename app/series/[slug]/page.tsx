import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesContent } from "@/components/series/SeriesContent";
import { absoluteUrl, siteConfig } from "@/lib/seo";
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

  return {
    title: { absolute: `${project.label} · Series · ${siteConfig.name}` },
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: `${project.label} · ${siteConfig.name}`,
      description,
      url: absoluteUrl(path),
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.label} · ${siteConfig.name}`,
      description,
    },
  };
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
  return <SeriesContent label={project.label} statement={project.statement} />;
}
